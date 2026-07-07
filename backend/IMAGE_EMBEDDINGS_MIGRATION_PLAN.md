# Plan: Replace description-based image search with direct image embeddings

## Summary

The current backend does **not** perform true image-to-image vector search. It:

1. Uses OpenAI vision/chat to generate a text description from the uploaded image.
2. Stores that description in Chroma as a text `Document`.
3. Searches Chroma with another generated text description.

To move to direct image embeddings, the backend needs more than a controller refactor:

- **OpenAI via the current Spring AI stack is only being used for vision/chat and text embeddings, not direct image embeddings.**
- So a real migration requires either:
  1. **switching to an embedding provider that supports image embeddings**, or
  2. **calling a custom image-embedding service** from the backend.

Because of that, this is a **data-model + provider + query-path migration**, not just a small code change.

## Current code path

### Indexing path

- `src\main\java\com\ecommerce\buyme\service\image\ImageService.java`
  - `saveImages(...)` saves Mongo image bytes, then calls `imageAsyncService.saveEmbeddingsAsync(payload)`.
  - `update(...)` replaces image bytes, deletes old vector entry, then re-enqueues embedding generation.

- `src\main\java\com\ecommerce\buyme\service\image\ImageAsyncService.java`
  - `saveEmbeddingsAsync(...)` calls `imageSearchService.saveEmbeddings(...)`.

- `src\main\java\com\ecommerce\buyme\service\image\ImageSearchService.java`
  - `saveEmbeddings(...)` calls `llmService.describeImage(payload)`.
  - Builds a Spring AI `Document` with:
    - `id = imageId`
    - `text = generated description`
    - metadata: `productId`, `imageId`, `documentId`
  - Stores it through `ChromaVectorStore.doAdd(...)`.

- `src\main\java\com\ecommerce\buyme\service\LLM\LLMService\LLMService.java`
  - `describeImage(...)` sends the image to OpenAI chat/vision and asks for a compact similarity-oriented caption.

### Query path

- `src\main\java\com\ecommerce\buyme\controller\ImageController.java`
  - `POST /images/search-by-image`
  - Reads uploaded bytes into `ImageEmbeddingPayload`.
  - Calls `llmService.describeImage(payload)`.
  - Builds `SearchRequest.query(imageDescription)`.
  - Calls `chromaVectorStore.doSimilaritySearch(...)`.
  - Returns matched `productId` values from document metadata.

### Chroma management path

- `src\main\java\com\ecommerce\buyme\service\chroma\ChromaService.java`
  - Used for collection inspection and delete-by-image-id.
  - Deletion already assumes each vector record is keyed by `imageId`, which still fits the direct-embedding design.

## Main migration constraint

### Direct image embeddings are not available in the current path

The backend currently depends on:

- `spring-ai-starter-model-openai`
- `spring-ai-starter-vector-store-chroma`

That combination supports the current flow because Spring AI can:

- send images into chat/vision prompts
- embed text for vector storage/search

But it does **not** give this codebase a direct `image bytes -> embedding vector` path with OpenAI in the same way it currently has `text -> embedding`.

## Recommended target architecture

### Goal

Use the **same embedding modality** for both:

- indexed catalog images
- search query images

That means:

1. Generate an embedding vector directly from the uploaded image bytes.
2. Store that vector in Chroma under the image record.
3. Query Chroma with another image embedding vector.
4. Return matching `productId` values from metadata.

### Recommended design

Introduce a provider-agnostic image embedding layer:

- `ImageEmbeddingProvider` or `ImageVectorizationService`
  - input: `ImageEmbeddingPayload`
  - output: `List<Float>` or provider-specific vector type

Then:

- `ImageSearchService`
  - index image vectors into Chroma
  - query Chroma by vector

- `ImageController`
  - delegate search to service instead of calling OpenAI/chat and `ChromaVectorStore` directly

- `LLMService`
  - remove from image-search/indexing path
  - keep only if needed elsewhere

## Concrete implementation plan

### Phase 1 - pick the embedding source

Decide which of these two approaches to use:

1. **Recommended: new image-embedding provider**
   - Add a provider that natively supports image embeddings.
   - Keep Chroma as the vector database.
   - Best if you want real image similarity rather than caption similarity.

2. **Alternative: custom sidecar/service**
   - Run an external image embedding service.
   - Backend sends image bytes to it and receives a vector.
   - Useful if you want to avoid large backend dependency changes.

If the requirement is to stay strictly on **OpenAI-only** for embeddings, this migration is blocked until that stack exposes direct image embedding support for the Java/Spring AI path you are using.

### Phase 2 - separate image embedding generation behind an interface

Create a new backend abstraction, for example:

```java
public interface ImageEmbeddingProvider {
    List<Float> embed(ImageEmbeddingPayload payload);
}
```

Why:

- keeps the rest of the code independent from the provider
- makes provider swaps safe
- avoids leaking provider-specific request objects into controllers/services

Expected files:

- new: `src\main\java\com\ecommerce\buyme\service\image\ImageEmbeddingProvider.java`
- new provider impl, for example:
  - `...service\image\ProviderBackedImageEmbeddingService.java`

### Phase 3 - move search logic out of `ImageController`

Refactor `ImageController.searchByImage(...)` so it no longer does:

- image description generation
- vector search assembly
- metadata extraction

Instead:

- inject `IImageSearchService`
- pass `ImageEmbeddingPayload`
- return the service result

This keeps the controller thin and makes the new path reusable for tests and future endpoints.

### Phase 4 - change indexing from text documents to image vectors

Refactor `ImageSearchService.saveEmbeddings(...)`.

Current behavior:

- generate description text
- build `Document.text(description)`
- `vectorStore.doAdd(...)`

Target behavior:

1. call `imageEmbeddingProvider.embed(payload)`
2. store the vector in Chroma
3. keep metadata:
   - `productId`
   - `imageId`
   - optional: `fileName`, `contentType`

Important note:

- `ChromaVectorStore` is oriented around Spring AI `Document` + text embedding flows.
- For direct vector insertion/query, you will likely need to use **lower-level Chroma API operations** instead of the current `SearchRequest.query(...)` path.
- Your existing `ChromaService` already uses `ChromaApi`, so extending that service is the cleanest direction.

Likely changes:

- extend `IChromaService`
- add methods such as:
  - `upsertImageEmbedding(...)`
  - `queryByEmbedding(...)`

## Phase 5 - query Chroma by vector instead of text

Replace this current path in `ImageController`:

```java
String imageDescription = llmService.describeImage(payload);
SearchRequest searchRequest = SearchRequest.builder().query(imageDescription)...
List<Document> searchResults = chromaVectorStore.doSimilaritySearch(searchRequest);
```

With:

1. generate query image embedding vector
2. call `chromaService.queryByEmbedding(...)`
3. map matches from metadata to `productId`

Important behavior decisions to make during implementation:

1. **Deduplicate product IDs or not**
   - current endpoint may return duplicate product IDs when multiple images from the same product match
   - decide whether to preserve current behavior or return unique products only

2. **Distance threshold tuning**
   - the current `similarityThreshold(0.85f)` is tied to the text-search path
   - direct image embeddings will need fresh tuning
   - start with `topK` only, then add thresholding after measuring actual scores

### Phase 6 - create a new Chroma collection and reindex

This is mandatory.

The current collection:

- `spring.ai.vectorstore.chroma.collection-name=image_collection`

contains vectors produced from **text descriptions**, not from raw images.

You should **not mix**:

- old text-derived embeddings
- new direct image embeddings

in the same collection, because:

- the vector meaning changes completely
- vector dimensionality may differ
- search quality will be invalid even if dimensions match

Recommended rollout:

1. create a new collection name, for example `image_collection_v2`
2. deploy code that writes only to the new collection
3. run a reindex job over all existing Mongo `Image` documents
4. switch search to the new collection
5. delete the old collection after validation

### Phase 7 - add a reindex mechanism

Existing images in Mongo need vectors regenerated with the new embedding provider.

Add one of these:

1. admin-only endpoint: `POST /api/v1/chroma/reindex-images`
2. startup-disabled maintenance job
3. standalone command/service method triggered manually

Reindex flow:

1. read all `Image` records from Mongo
2. rebuild `ImageEmbeddingPayload`
3. generate image embedding
4. upsert into new Chroma collection using `imageId` as the primary vector id

This should be **idempotent** so it can be resumed safely.

### Phase 8 - keep update/delete behavior aligned

These paths already exist and should be preserved:

- `ImageService.delete(...)`
  - delete Mongo image
  - delete vector entry by `imageId`

- `ImageService.update(...)`
  - replace bytes
  - delete old vector
  - regenerate vector asynchronously

After migration, verify they still target the **new collection** and the new vector format.

## Files that will change

### Definitely

- `src\main\java\com\ecommerce\buyme\controller\ImageController.java`
- `src\main\java\com\ecommerce\buyme\service\image\IImageSearchService.java`
- `src\main\java\com\ecommerce\buyme\service\image\ImageSearchService.java`
- `src\main\java\com\ecommerce\buyme\service\image\ImageAsyncService.java`
- `src\main\java\com\ecommerce\buyme\service\image\ImageService.java`
- `src\main\java\com\ecommerce\buyme\service\chroma\IChromaService.java`
- `src\main\java\com\ecommerce\buyme\service\chroma\ChromaService.java`
- `src\main\resources\application.properties`

### Likely

- `pom.xml`
  - only if a new provider/client library is needed

### Possibly removable or reduced

- `src\main\java\com\ecommerce\buyme\service\LLM\LLMService\LLMService.java`
  - no longer needed for image search if the migration is completed fully

## API contract impact

### Backend endpoint shape

You can keep this endpoint unchanged:

- `POST ${api.prefix}/images/search-by-image`

and only swap its internals.

That is the safest approach because it avoids frontend contract churn.

### Response shape

Current response:

- `ApiResponse("Search results as list of product IDs", productIds)`

This can stay unchanged.

## Testing and verification plan

### Unit/service-level

1. image embedding provider returns a vector for valid image MIME types
2. invalid MIME types are rejected consistently
3. `saveEmbeddings(...)` stores metadata with `imageId` and `productId`
4. `searchByImage(...)` maps Chroma matches back to product IDs correctly

### Integration-level

1. upload image for a product
2. confirm vector record exists in the new collection
3. search using the same image
4. verify the owning product is in the top results
5. update image and verify old vector is replaced
6. delete image and verify vector record is removed

### Migration-level

1. reindex all existing images into new collection
2. compare result quality on a sample set
3. switch search endpoint to new collection
4. remove old collection only after successful validation

## Risks and decisions

### 1. Provider lock-in

If you wire provider-specific calls directly into controllers or image services, future changes become expensive. Use an interface.

### 2. Collection compatibility

The old and new embeddings should be treated as different datasets. Do not reuse the current collection blindly.

### 3. Threshold instability

A threshold that worked for caption text search will not automatically work for true image embeddings.

### 4. Async indexing visibility

Newly uploaded images are indexed asynchronously today. That means search may not immediately see a just-uploaded image. This behavior already exists and should be explicitly accepted or redesigned.

## Recommended order of execution

1. Choose image embedding provider/service.
2. Add `ImageEmbeddingProvider` abstraction.
3. Extend `ChromaService` to upsert/query raw vectors.
4. Refactor `ImageSearchService` to use direct image embeddings.
5. Refactor `ImageController.searchByImage(...)` to delegate to the service.
6. Introduce a new Chroma collection for image-vector v2.
7. Build and run a reindex process for existing Mongo images.
8. Tune ranking/threshold behavior on real catalog images.
9. Remove the LLM description path from search/indexing once v2 is validated.

## Bottom line

This migration is feasible, but **not as a drop-in replacement inside the current OpenAI description flow**.

The real work is:

- introduce a true image embedding source
- store/query raw vectors in Chroma
- reindex the full image corpus into a new collection

Without that, the backend will remain caption-search over images rather than direct image similarity search.
