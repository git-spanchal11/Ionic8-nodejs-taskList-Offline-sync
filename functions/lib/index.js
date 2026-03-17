"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
// Initialize Firebase Admin (uses default credentials when deployed or emulated)
admin.initializeApp();
const db = admin.firestore();
const app = express();
app.use(cors({ origin: true }));
app.use(express.json());
// Mock Auth Middleware
const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        return;
    }
    const token = authHeader.split('Bearer ')[1];
    if (token !== 'mock-jwt-token-for-sagar') {
        res.status(401).json({ error: 'Unauthorized: Invalid token' });
        return;
    }
    next();
};
app.use(authenticate);
// --- ROUTES ---
// GET /tasks
app.get('/tasks', async (req, res) => {
    try {
        const snapshot = await db.collection('tasks').get();
        const tasks = snapshot.docs.map(doc => (Object.assign({ task_id: doc.id }, doc.data())));
        res.status(200).json(tasks);
    }
    catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// POST /tasks
app.post('/tasks', async (req, res) => {
    try {
        const { title, status } = req.body;
        if (!title) {
            res.status(400).json({ error: 'Bad Request: Missing title' });
            return;
        }
        // Allow custom taskId from client for offline sync consistency, or generate new
        const taskId = req.body.taskId || `T_${new Date().getTime()}`;
        const newTask = {
            title,
            status: status || 'Pending',
            created_at: new Date().toISOString()
        };
        await db.collection('tasks').doc(taskId).set(newTask);
        res.status(201).json(Object.assign({ task_id: taskId }, newTask));
    }
    catch (error) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// PUT /tasks/:id/status
app.put('/tasks/:id/status', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { status } = req.body;
        if (!status || !['Pending', 'In Progress', 'Done'].includes(status)) {
            res.status(400).json({ error: 'Bad Request: Invalid status' });
            return;
        }
        const taskRef = db.collection('tasks').doc(taskId);
        const doc = await taskRef.get();
        if (!doc.exists) {
            res.status(404).json({ error: 'Not Found: Task does not exist' });
            return;
        }
        await taskRef.update({ status });
        res.status(200).json({ message: 'Task status updated successfully', task_id: taskId, status });
    }
    catch (error) {
        console.error('Error updating task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// DELETE /tasks/:id
app.delete('/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const taskRef = db.collection('tasks').doc(taskId);
        await taskRef.delete();
        res.status(200).json({ message: 'Task deleted successfully', task_id: taskId });
    }
    catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});
// Export the Express API as a Firebase Cloud Function
exports.api = functions.https.onRequest(app);
//# sourceMappingURL=index.js.map