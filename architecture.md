# BuyMeShop Architecture

## Overview

BuyMeShop is a two-project e-commerce application:

- **`frontend`**: a React + TypeScript single-page app built with Vite.
- **`backend`**: a Spring Boot REST API backed by MongoDB and integrated with Stripe for payments.

At runtime, the frontend runs separately from the backend and talks to it over HTTP. The default local setup is:

| Part | Default |
| --- | --- |
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:9090` |
| API prefix | `/api/v1` |
| Database | MongoDB at `mongodb://localhost:27017/buyme_db` |

## Repository layout

```text
buymeshop/
|- backend/   Spring Boot API
`- frontend/  React SPA
```

## High-level runtime architecture

```text
Browser
  -> React SPA (frontend)
      -> Axios clients (`api`, `authApi`)
          -> Spring Boot REST API (backend)
              -> MongoDB
              -> Stripe Payment Intents API
```

## Frontend architecture

### Main responsibilities

- Route users through the storefront, cart, account, orders, checkout, and admin screens.
- Keep UI state in Redux Toolkit slices.
- Call the backend with Axios.
- Store the short-lived access token in `localStorage`.
- Refresh expired access tokens through a backend refresh-token cookie flow.

### Key frontend modules

| Area | Purpose |
| --- | --- |
| `src\App.tsx` | Route table and protected/admin-only screens |
| `src\component\layout` | Shared shell: navbar, footer, root layout, toast container |
| `src\component\product` | Product listing, details, add/edit/delete flows |
| `src\component\cart` | Cart display and quantity/removal actions |
| `src\component\checkout` | Stripe card payment and order placement |
| `src\component\auth` | Login, register, profile, route protection |
| `src\component\admin` | User/product administration UI |
| `src\store\features` | Domain slices for auth, users, products, cart, orders, categories, images, search, pagination |

### State management

Redux is split by domain:

- **`authSlice`**: login state, decoded roles, token persistence, logout.
- **`userSlice`**: current user, user list, address CRUD, admin user updates.
- **`productSlice`**: product catalog, distinct brands/products, selected filters, admin product mutations.
- **`cartSlice`**: cart contents, totals, add/update/remove actions, request de-duplication.
- **`orderSlice`**: order history, payment intent secret, order placement.
- Additional slices support categories, image upload state, search text/image search, and pagination.

### API access pattern

The SPA uses two Axios clients from `src\component\services\api.tsx`:

- **`api`** for public/unauthenticated requests.
- **`authApi`** for authenticated requests with `Authorization: Bearer <token>` and `withCredentials: true`.

`authApi` retries `401/403` responses once by calling `/auth/refresh-token`, storing the replacement access token, and replaying the original request.

### Route protection

`ProtectedRoute` blocks anonymous users from cart, orders, profile, and checkout routes, and restricts `/manage/:productId?` and `/admin` to users whose decoded JWT roles include `ADMIN`.

## Backend architecture

### Main responsibilities

- Expose REST endpoints for catalog, images, users, addresses, cart, orders, categories, and authentication.
- Authenticate users with Spring Security + JWT.
- Persist e-commerce documents in MongoDB.
- Create Stripe payment intents for checkout.

### Layering

The backend follows a conventional controller/service/repository split:

| Layer | Responsibility |
| --- | --- |
| `controller` | HTTP endpoints and response shaping |
| `service` / feature packages | Business logic |
| `repository` | MongoDB persistence via `MongoRepository` |
| `model` | MongoDB documents and embedded object graphs |
| `dtos`, `request`, `response` | API payloads |
| `security` | JWT auth, user details service, security config, CORS |
| `exceptions` | Central exception mapping |

### Major backend packages

| Package | Purpose |
| --- | --- |
| `controller` | REST entry points |
| `service\product`, `service\cart`, `service\order`, `service\user`, `service\address`, `service\image` | Domain logic |
| `repository` | Mongo repositories for users, roles, carts, cart items, products, images, categories, orders, addresses |
| `model` | Documents such as `User`, `Product`, `Cart`, `Order`, `Image`, `Address`, `Category`, `Role` |
| `security\config` | Spring Security filter chain and MVC CORS configuration |
| `security\jwt` | JWT generation, validation, and request filtering |
| `data` | Startup initialization of default roles |

### Security model

- Login happens at `POST /api/v1/auth/login`.
- The backend authenticates with `AuthenticationManager` and `ShopUserDetailService`.
- A successful login returns an **access token** in the response body and writes a **refresh token** into an HTTP-only cookie.
- `AuthTokenFilter` reads the bearer token from the `Authorization` header and populates the Spring Security context.
- `ShopConfig` makes the API stateless and currently requires authentication for:
  - `/api/v1/orders/**`
  - `/api/v1/carts/**`
  - `/api/v1/cartItems/**`
- Method-level authorization is used for admin product mutations with `@PreAuthorize("hasAuthority('ADMIN')")`.

### Persistence model

All repositories extend `MongoRepository`, so the persistence model is document-oriented rather than relational.

Important document relationships in the current design:

- **`User`** contains roles, addresses, a cart reference/object, and orders.
- **`Cart`** stores a `User`, a set of `CartItem`s, and a computed total.
- **`Order`** stores a `User`, a set of `OrderItem`s, status, total, and order date.
- **`Product`** stores category data directly; image binaries live in a separate `images` collection.
- **`Image`** stores the uploaded byte array plus a linked `Product`.

This design mixes separate Mongo collections with nested object snapshots, which is important when tracing updates across cart, user, order, and product documents.

### API domains

| Domain | Examples |
| --- | --- |
| Auth | `/auth/login`, `/auth/refresh-token` |
| Users | `/users`, `/users/user/{userId}`, `/users/add`, `/users/update/{userId}` |
| Addresses | `/addresses`, `/addresses/{addressId}`, `/addresses/user/{userId}` |
| Products | `/products`, `/products/product/{productId}`, `/products/add`, `/products/update/{productId}`, `/products/distinct/*` |
| Categories | `/categories/all`, `/categories/add`, `/categories/update/{id}` |
| Images | `/images/upload`, `/images/image/download/{imageId}`, `/images/delete/{imageId}/delete` |
| Cart | `/carts/user/{userId}`, `/cartItems/add`, `/cartItems/update/{cartId}/{productId}` |
| Orders | `/orders/order`, `/orders/user/{userId}`, `/orders/create-payment-intent` |

## Key business flows

### 1. Authentication and session continuation

1. User logs in from the SPA.
2. Backend returns a JWT access token and sets a refresh-token cookie.
3. Frontend stores the access token in `localStorage`.
4. Protected requests send the bearer token through `authApi`.
5. If the token expires, the frontend calls `/auth/refresh-token` and retries the failed request.

### 2. Product browsing

1. Home and product pages load product/category/brand data through public API calls.
2. Product details fetch a single product plus images.
3. Product filters are applied in frontend state using search/category/brand/pagination slices.

### 3. Cart management

1. Authenticated users add items through `/cartItems/add`.
2. Backend creates or reuses the user cart, stores cart items, and recalculates totals.
3. Frontend keeps a synchronized cart snapshot in `cartSlice`.

### 4. Checkout and ordering

1. Checkout requests a Stripe payment intent from `/orders/create-payment-intent`.
2. Stripe Elements confirms the card payment in the browser.
3. After successful payment, the SPA calls `/orders/order?userId=...`.
4. Backend converts cart items into order items, decrements product inventory, saves the order, and clears the cart.

### 5. Product media

1. Admin/product-management screens upload image files with multipart form data.
2. Backend stores image bytes in MongoDB and generates a download URL.
3. Product and cart UIs later resolve images via `/images/image/download/{imageId}`.

## Configuration and external dependencies

### Backend

- Spring Boot 4
- Java 25
- Spring Security
- Spring Data MongoDB
- ModelMapper
- JJWT
- Stripe Java SDK

Key runtime settings currently come from `application.properties` plus `.env`, including:

- `server.port`
- `api.prefix`
- `spring.mongodb.uri`
- JWT expiration values and signing secret
- `STRIPE_SECRET_KEY`
- `BASE_URL` for allowed CORS origin

### Frontend

- React 19
- TypeScript
- Vite
- Redux Toolkit
- React Router
- Axios
- Stripe JS / React Stripe JS
- Bootstrap / React Bootstrap / MUI

The frontend expects environment values such as:

- `VITE_BASE_URL` for the backend API base URL
- `VITE_STRIPE_PUBLIC_KEY` for Stripe Elements initialization

## Current architectural notes

- The repository is organized as **two independently runnable projects**, not a single full-stack build.
- The backend is the **system of record** for catalog, carts, users, addresses, images, and orders.
- The frontend owns **presentation state and client-side token storage**, but not business data.
- Image search is referenced in the frontend (`/products/search-by-image`), but the backend also contains `ai-integration.txt` indicating that AI-based image search was planned and not completed.
