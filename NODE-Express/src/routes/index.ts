import { Router, type Request, type Response } from "express";
import userRoutes from "./userRoutes.js";
import taskRoutes from "./taskRoutes.js";

const router = Router();

// Health check
router.get("/", (_req: Request, res: Response) => {
    res.json({ message: "API is working 🚀", version: "1.0.0" });
});

// Resources
router.use("/users", userRoutes);
router.use("/tasks", taskRoutes);

export default router;