# Node Express API (Monorepo)

This repository is a demo **Node.js + Express + TypeScript** project demonstrating a small CRUD API backed by local JSON files, with built-in **Swagger/OpenAPI** docs and an extensible microservice folder layout.

---

## 📦 Architecture Overview

### 🧩 Monorepo Structure
- **`src/`** — Main API application
  - `server.ts` — Express server entrypoint
  - `app.ts` — Express app configuration (middlewares, Swagger UI, routes)
  - `routes/` — Express routers (users, tasks, ...)
  - `controllers/` — Request handlers & business logic
  - `db/jsonDb.ts` — Simple JSON file read/write helper (acts as the database)
  - `swagger.ts` — Swagger/OpenAPI generation via `swagger-jsdoc`
  - `types/` — TypeScript model definitions
- **`data/`** — Local JSON “database” files (users.json, tasks.json, etc.)

### 🧠 Services (Optional microservices)
The `services/` folder is a lightweight microservice layout (each service has its own `package.json`, `src`, and `data` folder). It includes examples like:
- `auth-service/`
- `order-service/`
- `payment-service/`
- `notification-service/`
- `product-service/`

These services are separate Node apps and can be started individually in a real microservices setup.

---

## ⚙️ Setup & Run

### 1) Install dependencies

```bash
npm install
```

### 2) Start in development mode (hot reload)

```bash
npm run dev
```

By default, the dev server runs on **http://localhost:3000** and serves the API.

### 3) Build + start production

```bash
npm run build
npm start
```

---

## 🧭 API Endpoints

### ✅ Swagger / OpenAPI (Interactive API Docs)

Once the server is running, view the docs at:

- **Swagger UI**: `http://localhost:3000/api-docs`
- **Swagger JSON**: `http://localhost:3000/api-docs.json`

### 🔥 Core Endpoints (Main API)

#### Users
- `GET /api/users` — List all users
- `GET /api/users/:id` — Get a user by ID
- `POST /api/users` — Create a user
- `PUT /api/users/:id` — Update a user
- `DELETE /api/users/:id` — Delete a user

#### Tasks
- `GET /api/tasks` — List all tasks
- `POST /api/tasks` — Create a task
- `PUT /api/tasks/:id/status` — Update task status
- `DELETE /api/tasks/:id` — Delete a task
- `POST /api/tasks/sync` — Sync offline tasks (create/update/delete)

---

## 📄 Sync API Behavior (`POST /api/tasks/sync`)

This endpoint is designed to support offline sync scenarios.

### Request payload example

```json
{
  "tasks": [
    {
      "task_id": "T_123",
      "title": "Write docs",
      "status": "In Progress",
      "created_at": "2026-03-18T12:00:00Z"
    }
  ],
  "deletedTaskIds": ["T_456"]
}
```

- Incoming tasks are **created** if they don’t exist and **updated** if they do (client wins for provided fields).
- Tasks included in `deletedTaskIds` (or `deletedIds`) are removed from the data store.

---

## 🧪 Local Data Storage

All data is stored in JSON files under:

- `data/users.json`
- `data/tasks.json`

> ⚠️ This is for demo/poc purposes only. In a real app, replace this with a proper database (Postgres, MongoDB, etc.).

---

## 🛠️ Notes / Extending

- To add a new resource, add a new controller + router and update `src/routes/index.ts`.
- Swagger docs are generated from JSDoc comments inside `src/routes/*.ts`, so keeping those updated ensures the docs stay in sync.
