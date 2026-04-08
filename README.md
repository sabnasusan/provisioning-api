# Provisioning API

A TypeScript + Express API for managing provisioning requests, built with Domain-Driven Design (DDD) architecture, idempotency support, and comprehensive testing.

## Features

- **DDD Architecture**: Clean separation between domain, application, infrastructure, and interface layers
- **Idempotency Support**: Safe retries with idempotency keys
- **Validation**: Request validation using Zod schemas and domain value objects
- **Domain Rules**: Production environment requires key-vault component
- **Type Safety**: Full TypeScript with strict mode
- **Testing**: Integration and unit tests with Jest

## Installation

```bash
npm install
```

## Running the API

### Development

```bash
npm run dev
```

### Production

```bash
npm run build
npm start
```

The server runs on port 3000 by default (configurable via `PORT` environment variable).

## Running Tests

```bash
npm test
```

With coverage:

```bash
npm run test:coverage
```

## API Endpoints

### POST /provision

Create a new provisioning request.

**Headers:**

- `x-api-key`: Required API key for authentication
- `Content-Type`: `application/json`

**Request Body:**

```json
{
  "idempotencyKey": "unique-key-123",
  "requestor": "user@example.com",
  "environment": "dev",
  "workloadName": "my-service",
  "components": ["app-service"]
}
```

**Fields:**

- `idempotencyKey`: Non-empty string for idempotent requests
- `requestor`: Valid email address
- `environment`: One of `dev`, `staging`, `prod`
- `workloadName`: 3-30 characters, kebab-case format
- `components`: Non-empty array of component names

**Domain Rules:**

- Production (`prod`) environment requires `key-vault` in components

**Responses:**

- `201 Created`: Request created successfully
- `400 Bad Request`: Validation error
- `401 Unauthorized`: Missing API key
- `403 Forbidden`: Invalid API key
- `409 Conflict`: Idempotency key conflict (same key, different payload)

### GET /provision/:requestId

Retrieve a provisioning request by ID.

**Headers:**

- `x-api-key`: Required API key for authentication.

**Responses:**

- `200 OK`: Request found
- `401 Unauthorized`: Missing API key
- `403 Forbidden`: Invalid API key
- `404 Not Found`: Request not found

### GET /health

Health check endpoint (no authentication required).

**Responses:**

- `200 OK`: Service is healthy

## Environment Variables

| Variable   | Default       | Description                            |
| ---------- | ------------- | -------------------------------------- |
| `PORT`     | `3000`        | Server port                            |
| `API_KEYS` | `dev-api-key` | Comma-separated list of valid API keys |
| `NODE_ENV` | `dev`         | Environment mode                       |

## Architecture

This project follows Domain-Driven Design (DDD) principles with a layered architecture:

```
src/
├── domain/           # Core business logic (entities, value objects, errors)
├── application/      # Use cases and application services
├── infrastructure/   # External concerns (repositories, persistence)
├── interface/        # HTTP controllers, middleware, routes
```

### Design Principles (SOLID)

| Principle                 | Implementation                                                               |
| ------------------------- | ---------------------------------------------------------------------------- |
| **Single Responsibility** | Each class has one job (e.g., IdempotencyService only handles idempotency)   |
| **Open/Closed**           | Repository interface allows new implementations without changing use cases   |
| **Liskov Substitution**   | InMemoryRepository can be replaced with any database implementation          |
| **Interface Segregation** | Small, focused interfaces (IProvisioningRequestRepository)                   |
| **Dependency Inversion**  | Use cases depend on abstractions (repository interface), not implementations |

## Examples

### Create a provisioning request

```bash
curl -X POST http://localhost:3000/provision \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-api-key" \
  -d '{
    "idempotencyKey": "key-1",
    "requestor": "user@example.com",
    "environment": "dev",
    "workloadName": "my-service",
    "components": ["app-service"]
  }'
```

### Idempotent retry (returns same response)

```bash
curl -X POST http://localhost:3000/provision \
  -H "Content-Type: application/json" \
  -H "x-api-key: dev-api-key" \
  -d '{
    "idempotencyKey": "key-1",
    "requestor": "user@example.com",
    "environment": "dev",
    "workloadName": "my-service",
    "components": ["app-service"]
  }'
```

### Get a request by ID

```bash
curl http://localhost:3000/provision/{requestId} \
  -H "x-api-key: dev-api-key"
```

### Health check

```bash
curl http://localhost:3000/health
```

## Docker

### Build

```bash
docker build -t provisioning-api .
```

### Run

```bash
docker run -p 3000:3000 -e API_KEYS=my-secret-key provisioning-api
```
