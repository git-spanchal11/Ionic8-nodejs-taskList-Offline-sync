# Task Status Update App

This is a production-minded Ionic Angular application built for field employees. It strictly adheres to Ionic components, robust Angular Architecture, and provides full offline synchronization.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Run Application**
   ```bash
   npm start
   ```
3. **Login credentials (Mock Auth)**
   - **Email:** `sagar@gmail.com`
   - **Password:** `Password@123`

## Architecture Overview

The app follows a strict micro-level component and service-oriented architecture:

- **Dumb Components (`src/app/shared/components/`)**:
  - `LoginFormComponent`: Purely presentation and form emission logic.
  - `TaskItemComponent`: Stateless rendering of a single task.
- **Smart Components / Pages (`src/app/pages/`)**:
  - `LoginPage`: Acts as a container for authentication logic and routing.
  - `TaskListPage`: Acts as a container pulling data from `TaskService`, rendering the list, and handling action sheets.

### Services Layer (`src/app/core/services/`)
- `AuthService`: Handles mock static login logic using RxJS behavior subjects.
- `NetworkService`: Wraps `@capacitor/network` providing an `isOnline$` observable stream.
- `StorageService`: Centralized wrapper for `@ionic/storage-angular` managing async DB access.
- `TaskService`: Communicates with HTTP (via a mock `mock-tasks.json`) and handles aggressive caching into the Storage DB.
- `SyncService`: The brain of the offline capability. Instantiated at root to constantly listen to the `NetworkService` and manually flush any queued changes when resuming online connectivity.

### Interceptor Chain (`src/app/core/interceptors/`)
- `NetworkInterceptor`: Proactively blocks and prevents HTTP requests if the network is detected as offline.
- `LoaderInterceptor`: Intercepts every outgoing application request to universally toggle the Ionic `LoadingController`.
- `CamelCaseInterceptor`: Automatically transforms backend `snake_case` payloads into frontend `camelCase` model attributes on the fly. 

## Offline Sync Approach

1. **Caching Reads:** When `TaskService.getTasks()` is initially requested online, the response payload is stringified and saved aggressively to the `IonicStorage` layer. If an offline error occurs during a read, the cache is instantly returned.
2. **Queuing Actions:** When `TaskService.updateTaskStatus()` executes, it checks connectivity. If offline, the request payload is pushed asynchronously into an `idb-keyval` backed array named `sync_queue` sitting in device storage.
3. **Optimistic Rendering:** The UI immediately receives the new status change locally so the user feels no disruption. The `TaskListPage` observes the queue length, rendering an Ionic `<ion-icon name="sync-outline">` next to any task waiting for internet restoration.
4. **Resolution:** Globally, `SyncService` subscribes to the Capacitor Network Plugin. The exact split-second `isOnline = true` occurs, the queue is iterated over sequentially, dispatching HTTP PUT requests and removing successful entries.

## What I Would Improve With More Time

1. **Real backend DB (Firestore):** Currently relying on purely mock HTTP data since the requirements scope shifted mid-way to strictly Ionic HTML. Adding an `@angular/fire` implementation and securing Firestore Rules would be step one.
2. **Conflict Resolution:** For a true field application, utilizing a `updatedAt` backend timestamp check to prevent two devices from overriding the same task state blindly.
3. **PWA Support:** Generating service workers via `@angular/pwa` so the app is installable and caches the actual application source code assets (JS/HTML/CSS) while offline, not just the data payload.

## Scaling
- With a transition to **Cloud Functions / Cloud Run**, the backend can handle unpredictable loads cleanly.
- Transitioning the internal state management to something heavier like **NgRx Signal Store** if the application components scale beyond 20-30 screens.
