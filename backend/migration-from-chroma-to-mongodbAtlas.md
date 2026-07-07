# Migration estimate: Chroma -> MongoDB Atlas Vector Search

## Short answer

Yes, replacing the current locally run Chroma vector database with locally run MongoDB Atlas Vector Search is possible.

For this backend, it looks like a **moderate migration**, not a rewrite, because:

- the application already uses MongoDB for primary data
- vector usage is limited to a relatively small part of the backend
- but the current implementation is explicitly tied to Chroma APIs and config

## Estimated effort

| Scope | Estimate |
|---|---:|
| Local spike / proof of concept | 0.5-1 day |
| Backend replacement only | 2-4 dev days |
| Reindex + tuning + cleanup | 1-2 more days |
| Safe total | 3-6 dev days |

## Why the migration is feasible

This repository already stores its main business data in MongoDB, so moving vectors into MongoDB Vector Search is architecturally aligned.

That means you could keep:

- product and image documents in MongoDB
- vector embeddings in MongoDB as well
- vector search and metadata filtering in the same datastore

This reduces system sprawl compared with maintaining both:

- MongoDB for app data
- Chroma for vectors

## Why it is not just a config switch

The backend is currently coupled to Chroma in code and configuration.

### Current Chroma-specific pieces

- `pom.xml`
  - uses `spring-ai-starter-vector-store-chroma`

- `src\main\resources\application.properties`
  - contains Chroma host, port, collection, tenant, and database properties

- `src\main\java\com\ecommerce\buyme\controller\ImageController.java`
  - injects and uses `ChromaVectorStore`

- `src\main\java\com\ecommerce\buyme\service\image\ImageSearchService.java`
  - writes embeddings through `ChromaVectorStore`

- `src\main\java\com\ecommerce\buyme\service\chroma\ChromaService.java`
  - uses `ChromaApi` directly

- `src\main\java\com\ecommerce\buyme\controller\ChromaController.java`
  - exposes Chroma-specific collection and embedding endpoints

Because of that, the migration is not just:

- change dependency
- change URL
- restart app

It requires replacing Chroma-specific service and controller paths.

## Local MongoDB Atlas Vector Search: can it run locally?

Yes.

MongoDB provides a **local Atlas development experience** using Docker and Atlas CLI. MongoDB documentation states that local Atlas deployments can be used with:

- MongoDB Search
- MongoDB Vector Search

This means you can run a local development environment that supports vector indexing and vector queries without needing managed Atlas cloud for day-to-day local work.

## Is there any hidden cost to use MongoDB Atlas locally?

### Direct monetary cost

Usually **no Atlas cloud bill** for local development itself.

If you run local Atlas with Docker, the main costs are local infrastructure costs:

- CPU
- RAM
- disk space
- developer machine overhead

### Indirect / hidden costs

1. **Docker Desktop licensing**
   - On some business setups, Docker Desktop may require a paid license.
   - This is often the biggest practical hidden cost on local Windows/macOS machines.

2. **Heavier local resource usage**
   - MongoDB with vector indexes will usually consume more resources than a lightweight Chroma local setup.
   - Vector indexes add storage and memory pressure.

3. **Index build time**
   - Initial vector index creation and reindexing can take noticeable time.

4. **Shared database load**
   - If both operational data and vector search live in the same MongoDB instance, vector-heavy workloads can compete with normal application workloads.

5. **Dev/test only local Atlas behavior**
   - Local Atlas is useful for development, but it is not the same as managed Atlas cloud behavior at production scale.

## Important local limitation

Local Atlas should be treated as a **development/testing environment**, not a production-equivalent benchmark environment.

It is good for:

- local feature development
- schema/index experiments
- query pipeline testing

It is less reliable for:

- realistic production throughput benchmarks
- HA/failover behavior
- true production sizing decisions

## Expected effectiveness compared with Chroma

## Core point

The biggest driver of search quality is usually the **embedding model**, not the vector database.

If you keep the same embeddings and only change the vector store:

- semantic relevance should be in the same general range
- quality differences will mostly come from indexing strategy, filtering, and query tuning

## Where MongoDB Vector Search is strong

MongoDB Vector Search is a strong fit when:

- vectors are tightly coupled to Mongo documents
- you want metadata filters together with vector search
- you want fewer moving parts in the system
- you prefer one datastore over separate app DB + vector DB

That fits this backend fairly well because image/product data already lives in MongoDB.

## Where Chroma is simpler

Chroma is still simpler as a pure vector-focused local tool:

- lighter mental model
- smaller operational footprint
- fewer MongoDB-specific search index concerns

If the vector workload stays small and isolated, Chroma can remain easier to reason about.

## Performance and recall expectations

MongoDB Vector Search uses ANN search with HNSW and supports tuning through parameters like `numCandidates`.

MongoDB documentation recommends tuning query parameters to reach the recall/latency tradeoff you want, and notes that:

- around **90-95% recall** is a typical ANN target
- highly selective metadata filters can make vector queries more expensive

So effectiveness is good, but it is not “free”:

- query tuning matters
- index design matters
- metadata filtering can affect latency materially

## What likely changes in this repository

### Dependencies

- remove Chroma starter dependency
- add MongoDB Atlas Vector Search integration or equivalent Mongo-based vector access path

### Configuration

- remove Chroma connection properties
- add MongoDB Vector Search config and index definitions

### Service layer

- replace `ChromaService` with MongoDB vector search service logic
- update image embedding persistence and query code

### Controller layer

- remove or repurpose `ChromaController`
- update image search endpoints to query MongoDB Vector Search instead of Chroma

### Data migration

- reindex all existing embeddings into MongoDB vector fields/indexes

## Migration risks

1. **Reindex requirement**
   - Existing vectors in Chroma must be migrated or regenerated.

2. **Operational contention**
   - Combining app data and vectors in one local MongoDB instance can create noisy-neighbor effects.

3. **Query tuning work**
   - Good results may require iteration on `limit`, `numCandidates`, and filter strategy.

4. **Controller/API cleanup**
   - Existing Chroma-specific admin endpoints may no longer make sense as-is.

## Recommendation

For this repository, replacing local Chroma with local MongoDB Atlas Vector Search looks **reasonable** and probably a net simplification, because the app already depends on MongoDB.

I would approach it in this order:

1. build a small proof of concept locally
2. index a small sample of existing embeddings in MongoDB Vector Search
3. compare search latency and result quality against Chroma
4. if acceptable, replace the Chroma-specific service/config paths
5. run full reindex and remove old Chroma integration

## Bottom line

- **Possible:** yes
- **Hidden cloud cost locally:** generally no
- **Hidden practical costs:** local resources, Docker licensing, index build time, tuning effort
- **Effectiveness:** likely good enough and operationally cleaner for this repo, assuming the embedding model remains strong
- **Recommended next step:** do a local proof of concept before full migration
