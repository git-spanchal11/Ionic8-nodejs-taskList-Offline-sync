import type { Request, Response } from "express";
import path from "path";
import { randomUUID } from "crypto";
import { readDb, writeDb } from "../db/jsonDb.js";
import type { User, CreateUserInput } from "../types/user.js";

const DB_PATH = path.resolve("data/users.json");

// GET /api/users
export async function getAllUsers(_req: Request, res: Response): Promise<void> {
    const users = await readDb<User>(DB_PATH);
    res.json(users);
}

// GET /api/users/:id
export async function getUserById(req: Request, res: Response): Promise<void> {
    const users = await readDb<User>(DB_PATH);
    const user = users.find((u) => u.id === req.params["id"]);

    if (!user) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    res.json(user);
}

// POST /api/users
export async function createUser(req: Request, res: Response): Promise<void> {
    const { name, email, age } = req.body as CreateUserInput;

    if (!name || !email || age === undefined) {
        res.status(400).json({ message: "name, email, and age are required" });
        return;
    }

    const users = await readDb<User>(DB_PATH);

    // Check for duplicate by email
    const duplicate = users.find((u) => u.email === email);
    if (duplicate) {
        res.status(400).json({ message: "User with this email already exists" });
        return;
    }

    const newUser: User = {
        id: randomUUID(),
        name,
        email,
        age: Number(age),
    };

    users.push(newUser);
    await writeDb(DB_PATH, users);
    res.status(201).json(newUser);
}

// PUT /api/users/:id
export async function updateUser(req: Request, res: Response): Promise<void> {
    const users = await readDb<User>(DB_PATH);
    const index = users.findIndex((u) => u.id === req.params["id"]);

    if (index === -1) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    const existing = users[index] as User;
    const { name, email, age } = req.body as Partial<CreateUserInput>;

    const updated: User = {
        id: existing.id,
        name: name ?? existing.name,
        email: email ?? existing.email,
        age: age !== undefined ? Number(age) : existing.age,
    };

    users[index] = updated;
    await writeDb(DB_PATH, users);

    res.json(updated);
}

// DELETE /api/users/:id
export async function deleteUser(req: Request, res: Response): Promise<void> {
    const users = await readDb<User>(DB_PATH);
    const index = users.findIndex((u) => u.id === req.params["id"]);

    if (index === -1) {
        res.status(404).json({ message: "User not found" });
        return;
    }

    users.splice(index, 1);
    await writeDb(DB_PATH, users);

    res.json({ message: "User deleted successfully" });
}
