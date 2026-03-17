# Task Status Update App

This is a production-minded Ionic Angular application built for field employees. It strictly adheres to Ionic components, robust Angular Architecture, and provides full offline synchronization with a GCP backend.

## Setup Instructions

### Frontend (Ionic + Angular)
1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Run Application**
   ```bash
   npm start
   ```

### Backend (GCP Firebase Functions)
1. **Install CLI**
   ```bash
   npm install -g firebase-tools
   ```
2. **Initialize & Emulate**
   ```bash
   cd functions
   npm install
   npm run serve
   ```

### Login credentials (Mock Auth)
- **Email:** `sagar@gmail.com`
- **Password:** `password@123`

## Architecture Overview

The app follows a strict micro-level component and service-oriented architecture linking to a GCP Firebase backend:

- **Ionic Components**: Strictly utilizes built-in Ionic components (`ion-list`, `ion-item`, `ion-fab`, `ion-action-sheet`, `ion-alert`) for a native-mobile experience.
- **Interceptors**: 
  - `AuthInterceptor`: Attaches a Bearer token to all outgoing API requests.
  - `NetworkInterceptor`: Proactively blocks requests when offline.
  - `LoaderInterceptor`: Managed Global loading state via `LoadingController`.
  - `CamelCaseInterceptor`: Transforms backend `snake_case` to frontend `camelCase`.

## GCP Stack (Why these services?)

- **Firebase Functions (Cloud Functions)**: Chosen for its seamless integration with Firebase Auth and Firestore. It allows us to build a serverless REST API using Express.js without managing infrastructure.
- **Cloud Firestore**: A flexible, scalable NoSQL cloud database. Its real-time capabilities and offline-first SDK features make it perfect for task-based apps, though we've implemented a custom offline sync layer for granular control.
- **Firebase Auth (Mocked)**: Integrated into the middleware for security checks.

## Offline Sync Approach

- **Storage**: Offline changes (Status updates, Additions, Deletions) are stored in `@ionic/storage-angular` (IndexedDB).
- **Queueing**: Every destructive action is wrapped in a `SyncAction` object and pushed to a persistent queue if the network is unavailable.
- **Conflict Handling**: The `SyncService` processes the queue sequentially (FIFO) to ensure state transitions (e.g., Pending -> In Progress -> Done) happen in the correct order. 
- **Auto-Sync**: Uses `@capacitor/network` to detect reconnection and automatically triggers a queue flush to the GCP API.

## What I Would Improve With More Time

1. **Conflict Resolution**: Implement "Last Writer Wins" or "Server Timestamp Comparison" to handle multi-user edits on the same task.
2. **Push Notifications**: Use Firebase Cloud Messaging (FCM) to notify field employees of new assigned tasks in real-time.
3. **Automated Testing**: Expand the Jasmine suite to include E2E tests for the offline-online transition.

## Scaling
- **Cloud Run**: As the API grows, migrating from Cloud Functions to Cloud Run allows for better concurrency handling and custom containerization.
- **Global Firestore Deployment**: Enables multi-region data access for lower latency globally.
