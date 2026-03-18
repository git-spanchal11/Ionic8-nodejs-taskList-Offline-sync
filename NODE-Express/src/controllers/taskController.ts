import type { Request, Response } from "express";
import path from "path";
import { readDb, writeDb } from "../db/jsonDb.js";
import type { Task, CreateTaskInput, UpdateTaskStatusInput } from "../types/task.js";

const DB_PATH = path.resolve("data/tasks.json");

const VALID_STATUSES: Task["status"][] = ["Pending", "In Progress", "Done"];

export async function getAllTasks(_req: Request, _res: Response): Promise<void> {
    const tasks = await readDb<Task>(DB_PATH);
    _res.json(tasks);
}

export async function createTask(_req: Request, _res: Response): Promise<void> {
    const { title, status, taskId } = _req.body as CreateTaskInput;

    if (!title) {
        _res.status(400).json({ message: "Bad Request: Missing title" });
        return;
    }

    if (status && !VALID_STATUSES.includes(status)) {
        _res.status(400).json({ message: "Bad Request: Invalid status" });
        return;
    }

    const tasks = await readDb<Task>(DB_PATH);

    const newTask: Task = {
        task_id: taskId ?? `T_${new Date().getTime()}`,
        title: title,
        status: status ?? "Pending",
        created_at: new Date().toISOString(),
    };

    tasks.push(newTask);
    await writeDb(DB_PATH, tasks);

    _res.status(200).json(newTask);
}

export async function updateTaskStatus(_req: Request, _res: Response): Promise<void> {
    const taskId = _req.params.id;
    const { status } = _req.body as UpdateTaskStatusInput;

    if (!status || !VALID_STATUSES.includes(status)) {
        _res.status(400).json({ message: "Bad Request: Invalid status" });
        return;
    }

    const tasks = await readDb<Task>(DB_PATH);
    const index = tasks.findIndex((t) => t.task_id === taskId);

    if (index === -1) {
        _res.status(404).json({ message: "Not Found: Task does not exist" });
        return;
    }

    const existingTask = tasks[index];
    if (!existingTask) {
        _res.status(404).json({ message: "Not Found: Task does not exist" });
        return;
    }

    tasks[index] = { ...existingTask, status };
    await writeDb(DB_PATH, tasks);

    _res.status(200).json({ message: "Task status updated successfully", task_id: taskId, status });
}

export async function deleteTask(_req: Request, _res: Response): Promise<void> {
    const taskId = _req.params.id;
    const tasks = await readDb<Task>(DB_PATH);
    const index = tasks.findIndex((t) => t.task_id === taskId);

    if (index === -1) {
        _res.status(404).json({ message: "Not Found: Task does not exist" });
        return;
    }

    tasks.splice(index, 1);
    await writeDb(DB_PATH, tasks);

    _res.status(200).json({ message: "Task deleted successfully", task_id: taskId });
}

export async function syncTasks(_req: Request, _res: Response): Promise<void> {
    const { tasks: incoming, deletedTaskIds, deletedIds } = _req.body as {
        tasks: Array<Partial<Task> & { task_id?: string }>;
        deletedTaskIds?: string[] | string;
        deletedIds?: string[] | string;
    };

    if (!Array.isArray(incoming)) {
        _res.status(400).json({ message: "Bad Request: Missing tasks array" });
        return;
    }

    // Support both `deletedTaskIds` and `deletedIds` (and strings) for broader client compatibility.
    const rawDeleted = deletedTaskIds ?? deletedIds;
    const normalizedDeletedIds: string[] = typeof rawDeleted === "string" ? [rawDeleted] : Array.isArray(rawDeleted) ? rawDeleted : [];

    if (rawDeleted && !Array.isArray(rawDeleted) && typeof rawDeleted !== "string") {
        _res.status(400).json({ message: "Bad Request: deletedTaskIds must be a string or string array" });
        return;
    }

    if (normalizedDeletedIds.some((id) => typeof id !== "string")) {
        _res.status(400).json({ message: "Bad Request: deletedTaskIds must only contain strings" });
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
                _res.status(400).json({ message: "Bad Request: Missing title for new task" });
                return;
            }

            if (incomingStatus && !VALID_STATUSES.includes(incomingStatus)) {
                _res.status(400).json({ message: "Bad Request: Invalid task status" });
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
                _res.status(400).json({ message: "Bad Request: Invalid task status" });
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

    _res.status(200).json({ message: "Sync completed", tasks: finalTasks });
}
