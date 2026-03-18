import express, { type Application } from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import routes from "./routes/index.js";
import swaggerSpec from "./swagger.js";

const app: Application = express();

app.use(cors());
app.use(express.json());

// Swagger UI — interactive API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Swagger JSON spec endpoint
app.get("/api-docs.json", (_req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
});

app.use("/api", routes);

export default app;