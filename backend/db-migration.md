# Backend DB Migration Guide (MySQL/JPA -> MongoDB)

This guide is for replacing existing MySQL persistence code in the Java backend with MongoDB, without migrating old MySQL data.

## Scope

- Keep API behavior (controllers/DTO contracts) as stable as possible.
- Replace JPA/MySQL persistence implementation with Spring Data MongoDB.
- Start with a clean MongoDB database for new runtime data.

## 1. Dependencies and Configuration

1. Remove MySQL/JPA dependencies:
   - `spring-boot-starter-data-jpa`
   - MySQL JDBC driver
2. Add MongoDB dependency:
   - `spring-boot-starter-data-mongodb`
3. Replace MySQL properties in `application.properties`/`application.yml`:

```properties
spring.data.mongodb.uri=mongodb://localhost:27017/buymeshop
```

4. Remove no-longer-used SQL config:
   - `spring.datasource.*`
   - `spring.jpa.*`
   - Flyway/Liquibase config if only used for MySQL schema management

## 2. Domain Model Refactor (Entity -> Document)

1. Convert JPA entities to Mongo documents:
   - `@Entity`, `@Table` -> `@Document`
   - JPA `@Id @GeneratedValue` -> Mongo `@Id` (typically `String`)
2. Remove JPA relation annotations:
   - `@OneToMany`, `@ManyToOne`, `@ManyToMany`, `@JoinColumn`, etc.
3. Decide per relation:
   - **Embed** for tightly coupled child data (for example, cart items inside cart)
   - **Reference** for independent aggregates (for example, user and orders)
4. Align ID types consistently across model + DTO + service + controller (`Long`/`Integer` -> `String`).

## 3. Repository Layer Changes

1. Replace `JpaRepository<..., Long>` with `MongoRepository<..., String>`.
2. Rewrite JPQL/native SQL queries:
   - Use derived Mongo repository methods where possible.
   - Use Mongo `@Query` JSON syntax for custom filters.
3. Review sorting/paging methods and ensure they still map to Mongo-supported behavior.

## 4. Service Layer Changes

1. Remove SQL/JPA assumptions:
   - no lazy loading semantics
   - no implicit join behavior
   - no relational cascade behavior unless implemented explicitly
2. Handle referenced-document loading explicitly where needed.
3. Preserve transaction-sensitive business logic carefully:
   - if multi-document atomicity is required, use Mongo transactions only where necessary.
4. Update any validation/business rules that previously relied on relational constraints.

## 5. Relationship and Index Design

Recommended direction for e-commerce:

- **Embed**: cart items in cart document.
- **Reference**: users, orders, products as separate collections.

Create indexes early for critical queries:

- user email (unique)
- product lookup fields (for example name/category)
- order status and creation time
- frequently filtered foreign-reference fields

## 6. Security/Auth Integration

1. Replace auth-related JPA repositories with Mongo repositories.
2. Keep user lookup methods (for example `findByEmail`) equivalent.
3. Enforce unique email at database level via unique index.

## 7. Tests and Runtime Validation

1. Update persistence tests to target MongoDB.
2. Remove or adapt MySQL-specific test setup.
3. Validate core flows end-to-end:
   - registration/login
   - product browsing/search
   - cart operations
   - order creation and retrieval
4. Ensure response payloads remain compatible for the frontend.

## 8. Cleanup and Cutover

1. Remove old MySQL repositories/entities/config after Mongo path is fully active.
2. Delete SQL schema/init scripts not needed anymore.
3. Update README/environment docs with Mongo prerequisites and startup steps.
4. Keep one final checklist run before release:
   - build passes
   - tests pass
   - app starts cleanly with Mongo only

## Practical Implementation Order

1. Switch dependencies and config.
2. Convert one bounded module (for example users/auth) fully.
3. Convert repositories and services for that module.
4. Validate API behavior.
5. Repeat module-by-module (products -> cart -> orders).
6. Remove MySQL remnants at the end.
