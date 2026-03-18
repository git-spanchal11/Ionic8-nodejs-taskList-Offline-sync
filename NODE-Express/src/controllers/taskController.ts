import type { Request, Response } from "express";
import path from "path";
import { readDb, writeDb } from "../db/jsonDb.js";
import type { Task, CreateTaskInput, UpdateTaskStatusInput } from "../types/task.js";

const DB_PATH = path.resolve("data/tasks.json");

const VALID_STATUSES: Task["status"][] = ["Pending", "In Progress", "Done"];

export async function getAllTasks(_req: Request, res: Response): Promise<void> {
    const tasks = await readDb<Task>(DB_PATH);
    res.json(tasks);
}

export async function createTask(req: Request, res: Response): Promise<void> {
    const { title, status, taskId } = req.body as CreateTaskInput;

    if (!title) {
        res.status(400).json({ message: "Bad Request: Missing title" });
        return;
    }

    if (status && !VALID_STATUSES.includes(status)) {
        res.status(400).json({ message: "Bad Request: Invalid status" });
        return;
    }

    const tasks = await readDb<Task>(DB_PATH);

    const newTask: Task = {
        task_id: taskId ?? `T_${new Date().getTime()}`,
        title,
        status: status ?? "Pending",
        created_at: new Date().toISOString(),
    };

    tasks.push(newTask);
    await writeDb(DB_PATH, tasks);

    res.status(201).json(newTask);
}

export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
    const taskId = req.params.id;
    const { status } = req.body as UpdateTaskStatusInput;

    if (!status || !VALID_STATUSES.includes(status)) {
        res.status(400).json({ message: "Bad Request: Invalid status" });
        return;
    }

    const tasks = await readDb<Task>(DB_PATH);
    const index = tasks.findIndex((t) => t.task_id === taskId);

    if (index === -1) {
        res.status(404).json({ message: "Not Found: Task does not exist" });
        return;
    }

    const existingTask = tasks[index];
    if (!existingTask) {
        res.status(404).json({ message: "Not Found: Task does not exist" });
        return;
    }

    tasks[index] = { ...existingTask, status };
    await writeDb(DB_PATH, tasks);

    res.status(200).json({ message: "Task status updated successfully", task_id: taskId, status });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
    const taskId = req.params.id;
    const tasks = await readDb<Task>(DB_PATH);
    const index = tasks.findIndex((t) => t.task_id === taskId);

    if (index === -1) {
        res.status(404).json({ message: "Not Found: Task does not exist" });
        return;
    }

    tasks.splice(index, 1);
    await writeDb(DB_PATH, tasks);

    res.status(200).json({ message: "Task deleted successfully", task_id: taskId });
}

export async function syncTasks(req: Request, res: Response): Promise<void> {
    const { tasks: incoming, deletedTaskIds, deletedIds } = req.body as {
        tasks: Array<Partial<Task> & { task_id?: string }>;
        deletedTaskIds?: string[] | string;
        deletedIds?: string[] | string;
    };

    if (!Array.isArray(incoming)) {
        res.status(400).json({ message: "Bad Request: Missing tasks array" });
        return;
    }

    // Support both `deletedTaskIds` and `deletedIds` (and strings) for broader client compatibility.
    const rawDeleted = deletedTaskIds ?? deletedIds;
    const normalizedDeletedIds: string[] = typeof rawDeleted === "string" ? [rawDeleted] : Array.isArray(rawDeleted) ? rawDeleted : [];

    if (rawDeleted && !Array.isArray(rawDeleted) && typeof rawDeleted !== "string") {
        res.status(400).json({ message: "Bad Request: deletedTaskIds must be a string or string array" });
        return;
    }

    if (normalizedDeletedIds.some((id) => typeof id !== "string")) {
        res.status(400).json({ message: "Bad Request: deletedTaskIds must only contain strings" });
        return;
    }

    const tasks = await readDb<Task>(DB_PATH);
    const now = new Date().toISOString();

    // Apply incoming tasks (create or update)
    const merged = [...tasks];
    for (const item of incoming) {
        const existingIndex = merged.findIndex((t) => t.task_id === item.task_id);

        const incomingStatus = (item as Partial<Task>).status;
        const incomingTitle = item.title;
        const incomingCreatedAt = item.created_at;

        if (existingIndex === -1) {
            // New task from client
            if (!incomingTitle) {
                res.status(400).json({ message: "Bad Request: Missing title for new task" });
                return;
            }

            if (incomingStatus && !VALID_STATUSES.includes(incomingStatus)) {
                res.status(400).json({ message: "Bad Request: Invalid task status" });
                return;
            }

            const newTask: Task = {
                task_id: item.task_id ?? `T_${Date.now()}`,
                title: incomingTitle,
                status: incomingStatus ?? "Pending",
                created_at: incomingCreatedAt ?? now,
            };

            merged.push(newTask);
        } else {
            // Update existing task fields (client wins for provided fields)
            const existingTask = merged[existingIndex];
            if (!existingTask) {
                continue;
            }

            const updatedStatus = incomingStatus !== undefined
                ? VALID_STATUSES.includes(incomingStatus)
                    ? incomingStatus
                    : undefined
                : existingTask.status;

            if (incomingStatus !== undefined && updatedStatus === undefined) {
                res.status(400).json({ message: "Bad Request: Invalid task status" });
                return;
            }

            merged[existingIndex] = {
                ...existingTask,
                title: incomingTitle ?? existingTask.title,
                status: updatedStatus ?? existingTask.status,
                created_at: incomingCreatedAt ?? existingTask.created_at,
            };
        }
    }

    // Apply deletions from client (optional)
    const finalTasks = normalizedDeletedIds.length
        ? merged.filter((t) => !normalizedDeletedIds.includes(t.task_id))
        : merged;

    await writeDb(DB_PATH, finalTasks);

    res.status(200).json({ message: "Sync completed", tasks: finalTasks });
}
