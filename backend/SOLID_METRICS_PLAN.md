# Backend SOLID Metrics Plan

## Goal

Add **free-of-charge** backend quality checks that approximate SOLID design health for the Spring Boot codebase in `backend`.

This project should not try to produce a fake single "SOLID score". Instead, it should combine:

- **static code metrics** for class/method size, complexity, and coupling
- **architecture rules** for dependency direction and package boundaries
- **bug-finding checks** that catch design problems showing up as correctness issues

## Free tool stack

| Tool | Purpose | Why it helps with SOLID | Cost |
| --- | --- | --- | --- |
| **PMD** | complexity, size, duplication, design rules | useful for **SRP**, **ISP**, and overly large classes/methods | Free |
| **SpotBugs** | bytecode-level bug detection | catches risky implementations and bad practices that often appear in weak designs | Free |
| **Checkstyle** | structural/style guardrails | useful for max file size, method size, parameter count, and import rules | Free |
| **ArchUnit** | architecture tests in JUnit | best fit for **DIP**, layering, package boundaries, and cycle checks | Free |

## Recommended scope for this repository

Use the tools for the backend only:

- `backend\src\main\java\com\ecommerce\buyme\controller`
- `backend\src\main\java\com\ecommerce\buyme\service`
- `backend\src\main\java\com\ecommerce\buyme\repository`
- `backend\src\main\java\com\ecommerce\buyme\security`
- `backend\src\main\java\com\ecommerce\buyme\config`
- `backend\src\main\java\com\ecommerce\buyme\model`

Do **not** block the first rollout on cleaning every legacy warning. Start with a baseline and tighten rules gradually.

## What to add to the project

### 1. Maven plugins in `backend\pom.xml`

Add these Maven plugins:

- `maven-pmd-plugin`
- `spotbugs-maven-plugin`
- `maven-checkstyle-plugin`

Keep them as explicit plugins in the existing `<build><plugins>` section.

### 2. ArchUnit test dependency in `backend\pom.xml`

Add an ArchUnit JUnit 5 test dependency:

- `com.tngtech.archunit:archunit-junit5`

This fits the current test setup because the backend already uses JUnit 5 in `src\test\java\com\ecommerce\buyme\BuymeApplicationTests.java`.

### 3. Config files under `backend`

Add:

- `backend\config\pmd\ruleset.xml`
- `backend\config\checkstyle\checkstyle.xml`
- `backend\config\spotbugs\exclude.xml` *(optional, only if needed for noise reduction)*

### 4. Architecture tests under `src\test`

Add a package such as:

- `backend\src\test\java\com\ecommerce\buyme\architecture\LayerArchitectureTest.java`
- `backend\src\test\java\com\ecommerce\buyme\architecture\DependencyRulesTest.java`

## Recommended rules by SOLID area

## S — Single Responsibility Principle

Use PMD and Checkstyle to detect classes and methods that are trying to do too much.

Recommended checks:

- PMD:
  - `CyclomaticComplexity`
  - `NPathComplexity`
  - `ExcessiveClassLength`
  - `ExcessiveMethodLength`
  - `TooManyMethods`
  - `CouplingBetweenObjects`
  - `GodClass`
- Checkstyle:
  - `FileLength`
  - `MethodLength`
  - `ParameterNumber`

Suggested first thresholds:

- class length: **500-800** lines
- method length: **40-60** lines
- max parameters: **6-7**
- cyclomatic complexity: **10-15**

These should be treated as a starting point, then adjusted to the real codebase after the first run.

## O — Open/Closed Principle

This is hard to score directly, so focus on structure:

- services should expose interfaces where extension is expected
- controllers should delegate instead of embedding business logic
- configuration and strategy-like behavior should stay outside controllers

Useful proxies:

- PMD design/size rules for large switch-heavy or branch-heavy methods
- ArchUnit rules that keep extension points inside service/config layers instead of leaking into controllers

## L — Liskov Substitution Principle

LSP is also hard to measure directly. For this codebase, the practical approach is:

- keep inheritance shallow
- prefer composition in services
- add tests for contract-sensitive abstractions where polymorphism exists

Useful proxies:

- SpotBugs for implementation issues that break expected behavior
- targeted unit tests where interfaces have multiple implementations

This repository currently relies more on package layering than on large inheritance hierarchies, so LSP should be treated as a **secondary concern** in the first rollout.

## I — Interface Segregation Principle

Use PMD and code review rules to keep interfaces focused.

Useful checks:

- PMD `TooManyMethods`
- PMD `ExcessivePublicCount`
- Checkstyle/PMD thresholds on class and method counts

Repository-specific target:

- keep service interfaces such as `IUserService`, `IProductService`, `IOrderService`, `IImageService`, and `IChromaService` focused on a single domain responsibility

## D — Dependency Inversion Principle

This is where **ArchUnit** is most valuable.

Add architecture rules such as:

1. controllers may depend on:
   - service interfaces/services
   - request/response/dto/model objects
   - framework classes
2. controllers must **not** depend directly on repositories
3. repositories must not depend on controllers or services
4. services may depend on repositories, models, and other services, but not on controllers
5. config and security packages should not depend on controller implementations unless there is a strong framework reason
6. packages should be free of cycles where possible

## Repository-specific ArchUnit rules

Start with these rules for `com.ecommerce.buyme`:

### Layer rule

- `controller..` should only be accessed by the web/framework layer
- `service..` should not access `controller..`
- `repository..` should only be accessed by `service..`, configuration, or framework wiring

### No direct repository usage from controllers

This is especially important because the backend is meant to follow controller -> service -> repository flow.

### Package cycle checks

Run cycle checks on:

- `controller`
- `service`
- `repository`
- `security`
- `config`
- `category`

### Security boundary checks

Because auth and security are sensitive in this project:

- keep JWT/security helpers under `security`
- avoid business services depending on controller-layer auth helpers

## Suggested Maven commands

After integration, the backend should support commands such as:

```powershell
cd backend
.\mvnw.cmd test
.\mvnw.cmd pmd:pmd
.\mvnw.cmd checkstyle:checkstyle
.\mvnw.cmd spotbugs:spotbugs
.\mvnw.cmd verify
```

Recommended end state:

- `test` runs normal tests plus ArchUnit tests
- `verify` runs the static-analysis plugins in one standard CI-friendly command

## Suggested implementation phases

### Phase 1 — Add tooling without failing the build

1. add Maven plugins
2. add ArchUnit dependency
3. add minimal PMD and Checkstyle configs
4. add initial ArchUnit rules
5. run everything once and collect findings

Goal: produce reports first, without blocking developers immediately.

### Phase 2 — Enable soft gates

Start failing the build only for high-value rules:

- controller -> repository dependency violations
- package cycles
- very high complexity / very large methods
- SpotBugs high-priority issues

### Phase 3 — Tighten thresholds

After the first cleanup pass:

- lower complexity thresholds
- lower file/method size limits
- add more focused PMD rules
- reduce SpotBugs exclusions if any were added

## CI integration

If CI is added later, use `verify` as the quality gate entry point.

Recommended behavior:

- PRs run `.\mvnw.cmd verify`
- generated reports are uploaded as artifacts if the pipeline supports it
- architecture-test failures should block merges before cosmetic style issues do

## Practical success criteria

The rollout is successful when the backend can:

1. detect oversized classes and methods
2. detect excessive complexity and coupling
3. prevent controller -> repository shortcuts
4. prevent package cycles in core layers
5. surface high-confidence Java bug patterns

## Extra section: SonarQube

If a dashboard is wanted later, add **SonarQube Community Build** as an optional final layer.

### Why add it

- central dashboard for PMD/SpotBugs-style quality concerns
- trends over time
- maintainability and security visibility
- free when self-hosted with the Community Build

### How to use it in this project

1. keep PMD, Checkstyle, SpotBugs, and ArchUnit as the real enforcement layer inside Maven
2. add SonarQube Community Build separately as a reporting/dashboard tool
3. configure backend analysis only at first
4. run Sonar after `verify`

### Important limitation

For a fully free setup, prefer **SonarQube Community Build self-hosted**. Do not assume cloud-hosted Sonar for private code will remain free.

### Recommendation

Start **without SonarQube**, get Maven-based checks stable first, then add SonarQube Community Build only if a centralized dashboard is useful.
