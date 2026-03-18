import { promises as fs } from "fs";

/**
 * Read and parse a JSON file as an array of T.
 */
export async function readDb<T>(filePath: string): Promise<T[]> {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T[];
}

/**
 * Serialize and write an array of T to a JSON file.
 */
export async function writeDb<T>(filePath: string, data: T[]): Promise<void> {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}
