# Circuit Breaker Implementation Plan

## 1. Goal and scope

Add circuit breakers around remote services that can become slow or unavailable without taking down the rest of the application.

Initial scope:

| Dependency | Circuit breaker | Reason |
| --- | --- | --- |
| OpenAI | `openAi` | Image description requests are remote, comparatively slow, and used by both image search and embedding generation. |
| Chroma | `chroma` | Similarity searches and vector mutations depend on a separate service. |
| Stripe | Later, if production metrics justify it | Checkout has no safe fallback. Timeouts and idempotency must be implemented first. |
| MongoDB | No application circuit breaker | Use MongoDB driver connection, server-selection, and socket timeouts instead. |

OpenAI and Chroma must have independent circuit breakers. An OpenAI outage must not open the Chroma circuit, and the reverse must also be true.

## 2. Establish the failure contract

Before adding annotations, define consistent behavior for unavailable dependencies:

1. Add an `ExternalServiceUnavailableException` under `backend\src\main\java\com\ecommerce\buyme\exceptions`.
2. Include the dependency name in the exception without exposing credentials, request bodies, or provider response bodies.
3. Add a handler to `GlobalExceptionHandler` that returns HTTP `503 Service Unavailable`.
4. Return the normal `ApiResponse` shape:

   ```json
   {
     "message": "Image search is temporarily unavailable",
     "data": null
   }
   ```

5. Remove the broad `try/catch` in `ImageController.searchByImage()`. It currently converts every error, including invalid input and dependency outages, into HTTP 500.
6. Do not use empty search results as a fallback. An empty list means “no similar products,” while an open circuit means “search could not run.”

## 3. Add Resilience4j dependencies

Update `backend\pom.xml`:

1. Add the Resilience4j Spring Boot starter compatible with the repository's Spring Boot `4.1.0` version.
2. Add Spring AOP support because annotation-based circuit breakers require proxied Spring beans.
3. Add Spring Boot Actuator for circuit-breaker health and metrics.
4. Keep the Resilience4j version in a Maven property or BOM rather than repeating it.
5. Confirm compatibility with Spring Boot 4 before selecting the starter version. Do not assume that a starter targeting an older Spring Boot generation is compatible.

Expected dependency roles:

- Resilience4j circuit-breaker implementation and Spring annotations.
- AOP proxy support.
- Actuator health indicators and Micrometer metrics.

Run after changing the POM:

```powershell
cd backend
.\mvnw.cmd test
```

## 4. Centralize external calls behind Spring beans

Circuit-breaker annotations only work when a method is called through a Spring proxy. They do not protect private methods or self-invocation inside the same bean.

### OpenAI boundary

Use `LLMService.describeImage()` as the OpenAI boundary, or rename it to a clearer gateway such as `OpenAiImageDescriptionService`.

1. Keep MIME-type validation outside the protected remote call, or configure `IllegalArgumentException` as an ignored exception.
2. Put `@CircuitBreaker(name = "openAi", fallbackMethod = "describeImageFallback")` on the public proxied method that calls `ChatModel`.
3. Make the fallback signature match the protected method plus a final `Throwable` parameter.
4. Have the fallback throw `ExternalServiceUnavailableException`; do not generate a fabricated image description.

### Chroma boundary

Chroma is currently called through multiple paths:

- `ChromaService` uses `ChromaApi`.
- `ImageSearchService.saveEmbeddings()` calls `ChromaVectorStore.doAdd()`.
- `ImageController.searchByImage()` calls `ChromaVectorStore.doSimilaritySearch()` directly.

Consolidate these calls:

1. Add public methods to a Chroma-facing service/gateway for:
   - similarity search;
   - adding documents;
   - collection operations;
   - reading and deleting embeddings.
2. Annotate the public gateway methods with `@CircuitBreaker(name = "chroma", fallbackMethod = "...")`.
3. Move the direct `ChromaVectorStore` dependency out of `ImageController`.
4. Add an image-search service method that performs the OpenAI description followed by the Chroma similarity search.
5. Keep controllers responsible only for HTTP input/output.
6. Replace broad `catch (Exception)` blocks in `ChromaService` with narrow exception translation where the client API allows it. Preserve the original cause.
7. Avoid relying on annotations placed on private helpers such as `fetchEmbeddingsByImageId()` because those calls bypass Spring AOP.

## 5. Configure timeouts before circuit breakers

A circuit breaker does not stop an individual request from hanging. Configure client timeouts for OpenAI and Chroma before enabling the breakers:

1. Set connection and response/read timeouts on the HTTP clients used by Spring AI.
2. Choose an OpenAI timeout that accommodates normal image-description latency.
3. Use a shorter timeout for local Chroma calls.
4. Verify the exact supported Spring AI properties or client-builder APIs for version `2.0.0`; do not add guessed property names.
5. Configure Stripe SDK connection/read timeouts separately even if Stripe is not initially circuit-protected.

Starting targets, to be tuned from measurements:

| Dependency | Connection timeout | Total/read timeout |
| --- | ---: | ---: |
| OpenAI | 2 seconds | 15 seconds |
| Chroma | 1 second | 5 seconds |

## 6. Configure the circuit breakers

Add named instances to `backend\src\main\resources\application.properties`, or move resilience settings to a dedicated imported properties/YAML file if that is clearer.

Use these as initial values rather than permanent assumptions:

| Setting | OpenAI | Chroma |
| --- | ---: | ---: |
| Sliding window type | count based | count based |
| Sliding window size | 20 calls | 20 calls |
| Minimum calls before evaluation | 10 | 10 |
| Failure-rate threshold | 50% | 50% |
| Slow-call threshold | 50% | 50% |
| Slow-call duration | 8 seconds | 2 seconds |
| Open-state wait duration | 30 seconds | 20 seconds |
| Permitted half-open calls | 3 | 3 |
| Automatic open-to-half-open transition | enabled | enabled |
| Health indicator | enabled | enabled |

Record:

- connection failures;
- socket/read timeouts;
- provider HTTP 5xx responses;
- rate-limit responses when repeated rate limiting should temporarily shed load;
- `ChromaOperationException` only when it represents a remote Chroma failure.

Ignore:

- invalid image MIME types;
- request validation errors;
- authentication and authorization failures from this application;
- entity-not-found and other business exceptions;
- caller-side HTTP 4xx errors, except deliberate handling of rate limits.

Do not add retries blindly. Retrying inside a slow outage increases load and delays opening the circuit. If retries are later added, use a small bounded count, backoff with jitter, and ensure retry executes inside the circuit-breaker policy in the intended order.

## 7. Refactor the image-search flow

Change `ImageController.searchByImage()` to call one application service method:

1. Validate and construct `ImageEmbeddingPayload`.
2. Call OpenAI through the `openAi` circuit breaker.
3. Build the `SearchRequest`.
4. Call Chroma through the `chroma` circuit breaker.
5. Map document metadata to product IDs.
6. Return `ApiResponse` from the controller.

Expected outcomes:

- Invalid image: HTTP 400.
- OpenAI or Chroma unavailable/open: HTTP 503.
- Valid search with no matches: HTTP 200 with an empty list.
- Successful search: HTTP 200 with product IDs.

## 8. Handle asynchronous embedding generation correctly

`ImageAsyncService.saveEmbeddingsAsync()` currently catches an exception, logs it, and permanently loses the embedding job. A circuit breaker makes failures faster but does not make this workflow reliable.

Implement in two phases:

### Phase A: circuit-breaker behavior

1. Let OpenAI and Chroma gateway calls use their respective breakers.
2. Catch `ExternalServiceUnavailableException` at the asynchronous job boundary.
3. Log the image ID, product ID, dependency, and outcome as structured fields.
4. Do not repeatedly submit work while a circuit is open.
5. Review `imageSummaryExecutor` queue capacity (`200`) and rejection policy so outages cannot cause unbounded waiting or silent rejection.

### Phase B: durable retry

1. Store an embedding job/status in MongoDB, for example `PENDING`, `PROCESSING`, `COMPLETED`, or `FAILED`.
2. Retry pending jobs with bounded attempts and exponential backoff.
3. Keep the operation idempotent by using `imageId` as the stable Chroma document ID.
4. Persist the last error category and next retry time, but not image bytes or provider responses in logs.
5. Mark a terminal failure after the configured attempt limit and make it observable to administrators.

Do not treat an in-memory executor queue as durable retry storage.

## 9. Treat Stripe as a separate follow-up

Before applying a circuit breaker to `OrderService.createPaymentIntent()`:

1. Add a Stripe idempotency key derived from a stable checkout attempt identifier.
2. Configure Stripe SDK timeouts.
3. Distinguish network/5xx failures from card, validation, and authentication errors.
4. Return HTTP 503 only for temporary Stripe unavailability.
5. Never retry payment creation without idempotency.
6. Add a `stripe` circuit only if metrics show repeated outages or resource exhaustion.

There is no safe “successful” fallback for payment intent creation.

## 10. Add observability

1. Expose Actuator `health` and the required metrics endpoints only.
2. Enable Resilience4j health indicators.
3. Record breaker state transitions: `CLOSED`, `OPEN`, and `HALF_OPEN`.
4. Monitor:
   - call count by dependency and outcome;
   - failure and slow-call rates;
   - rejected calls while open;
   - latency;
   - async executor active threads and queue depth;
   - pending and failed embedding jobs.
5. Add alerts for sustained open state and growing embedding backlog.
6. Do not expose Actuator details publicly or log secrets, uploaded image bytes, Stripe client secrets, or OpenAI response bodies.

## 11. Add automated tests

Create focused tests under `backend\src\test\java\com\ecommerce\buyme`.

### Circuit-breaker tests

1. Repeated recorded OpenAI failures open only the `openAi` circuit.
2. Repeated Chroma failures open only the `chroma` circuit.
3. Once open, calls fail fast without invoking the underlying client.
4. After the wait duration, successful half-open probes close the circuit.
5. Failed half-open probes reopen it.
6. Ignored validation/business exceptions do not affect failure rate.
7. Slow calls count according to the configured threshold.

Use small test-only windows and wait durations so the suite remains fast. Do not use production timing values in tests.

### Web/API tests

1. An unavailable OpenAI dependency returns HTTP 503 and the `ApiResponse` shape.
2. An unavailable Chroma dependency returns HTTP 503 and the same shape.
3. Invalid MIME type returns HTTP 400 and does not increment breaker failures.
4. A valid search with no matches returns HTTP 200 with an empty list.

### Async tests

1. An open circuit does not lose a durable embedding job.
2. Retry attempts are bounded.
3. A successful retry marks the job completed.
4. Reprocessing the same image does not create duplicate Chroma documents.

Run targeted tests first, then the backend suite:

```powershell
cd backend
.\mvnw.cmd -Dtest=<CircuitBreakerTestClasses> test
.\mvnw.cmd test
```

## 12. Rollout sequence

1. Add exception mapping and explicit client timeouts.
2. Add dependencies and circuit-breaker configuration.
3. Introduce the OpenAI gateway breaker.
4. Consolidate Chroma calls and introduce the Chroma gateway breaker.
5. Refactor image search so the controller has no direct external-client dependency.
6. Add metrics and health indicators.
7. Add circuit-breaker and API tests.
8. Deploy with conservative thresholds and observe normal traffic.
9. Tune thresholds using measured latency and failure rates.
10. Add durable async embedding retries.
11. Evaluate Stripe separately after idempotency and timeout work.

## 13. Definition of done

The implementation is complete when:

- OpenAI and Chroma have independent, observable circuit breakers.
- Every protected call has a finite timeout.
- Open circuits fail fast with HTTP 503 rather than HTTP 500 or fake successful data.
- Validation and business errors do not open circuits.
- Controllers do not invoke Chroma or OpenAI clients directly.
- Async embedding failures are not silently lost.
- Circuit state transitions and async backlog are measurable.
- Tests prove open, half-open, closed, ignored-error, API, and async behavior.
- `.\mvnw.cmd test` and `.\mvnw.cmd package` complete successfully.
