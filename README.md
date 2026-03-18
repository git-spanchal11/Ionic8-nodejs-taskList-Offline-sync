# Task Status Update App

A Ionic Angular application. This project focuses on high-performance architecture, robust offline-first synchronization, and a scalable Node.js + Express backend.


## 🚀 Key Features

- **Offline-First**: Fully functional when offline (Add, Update, Delete tasks).
- **Intelligent Sync**: Merges redundant offline actions (Squashing) to minimize API calls.
- **Native Experience**: Built strictly with Ionic components for a premium mobile feel.
- **GCP Powered**: Serverless architecture using Firebase Functions and Cloud Firestore.
- **Real-time Feedback**: Visual sync progress with percentage and status monitoring.


## 🛠 Technology Stack

- **Frontend**: [Ionic Framework](https://ionicframework.com/), [Angular 17+](https://angular.io/)
- **Cross-Platform**: [Capacitor](https://capacitorjs.com/) (Network & Storage)
- **State & Logic**: [RxJS](https://rxjs.dev/) (Reactive Programming), [Lodash](https://lodash.com/) (Data manipulation)
- **Backend**: [Firebase Functions](https://firebase.google.com/docs/functions) (Node.js/Express)
- **Database**: [Cloud Firestore](https://firebase.google.com/docs/firestore) (NoSQL)
- **Styling**: Vanilla CSS with Ionic Design System tokens.

---

## 🏗 Architecture Overview

The application follows a **Clean Service-Oriented Architecture**:

### 1. Core Services Layer
- `HttpService`: A wrapper for `HttpClient` that enforces pre-flight network checks.
- `TaskService`: Manages task state, local caching, and synchronization logic.
- `SyncService`: Orchestrates the background synchronization process and queue optimization.
- `NetworkService`: Reactive monitor for device connectivity status.
- `StorageService`: Persistent local storage using Ionic Storage (IndexedDB/SQLite).

### 2. Interceptor Layer
- `AuthInterceptor`: Automatically attaches Bearer JWT tokens to API requests.
- `NetworkInterceptor`: Global guard that blocks requests if the device is offline.
- `LoaderInterceptor`: Managed global loading spinner based on active request counts.
- `CamelCaseInterceptor`: Seamlessly maps backend `snake_case` to frontend `camelCase`.

### 3. Backend (GCP)
- **Express API**: Hosted on Cloud Functions for a scalable, serverless REST interface.
- **Firestore DAL**: Uses the `firebase-admin` SDK for high-performance atomic writes.

---

## 🚦 Setup & Installation

### Prerequisite
- Node.js (v18+)
- Ionic CLI (`npm install -g @ionic/cli`)
- Firebase CLI (`npm install -g firebase-tools`)

### Quick Start (Dev Mode)
1. **Clone and Install**
   ```bash
   npm install
   cd functions && npm install && cd ..
   ```
2. **Launch Both Frontend & Backend**
   ```bash
   npm run dev
   ```
   *This command starts the Ionic dev server (port 8100) and the Firebase Emulator (port 4000) simultaneously.*

---

## 🔄 Offline Synchronization Approach

The app implements a **Persistent Queue-Based Synchronization** strategy:

1.  **Local Persistence**: Every user action (Add/Status Update/Delete) is immediately saved to the local cache and a `SyncQueue` in storage.
2.  **Queue Squashing (Optimization)**: Before syncing, the app analyzes the queue. If a task was updated 5 times offline, or added and then deleted, those actions are merged into a single final state to save bandwidth and reduce server load.
3.  **Automatic Reconnect**: The `NetworkService` detects when connectivity returns and triggers the `SyncService.flushQueue()`.
4.  **Batch Sync Readiness**: The frontend is architected to support atomic batch writes (e.g., `POST /tasks/sync`), reducing a sync session to a single API call if supported by the backend.

---

## 📈 Future Improvements & Scalability

### Improvements with More Time
- **Conflict Resolution**: Implement "Last-Writer-Wins" or "Operational Transformation" for multi-user collaboration.
- **Push Notifications**: Integrate Firebase Cloud Messaging (FCM) to alert employees of task assignments.
- **Deep Testing**: Expand unit tests to cover complex edge cases in the queue squashing logic.

### Scaling Strategy
- **Cloud Run**: Migrate the API from Cloud Functions to Cloud Run to handle higher concurrency and reduce cold-start latency.
- **Global Deployment**: Leverage Firestore's multi-region capabilities to ensure sub-second latency for field employees worldwide.
- **Caching Layer**: Introduce Redis via Google Cloud Memorystore for high-frequency metadata access.

---

## 👤 Login Credentials (Mock)
- **Email**: `sagar@gmail.com`
- **Password**: `password@123`



## ===================== BACK END ======================
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



## Terminal 1 (Backend):
cd FE_TaskList/NODE-Express
npm run dev

## Terminal 2 (Frontend):
cd FE_TaskList
ionic serve