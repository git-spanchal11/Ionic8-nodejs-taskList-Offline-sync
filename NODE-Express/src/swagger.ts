import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Node Express API",
            version: "1.0.0",
            description:
                "A demo CRUD REST API built with Node.js, Express, and TypeScript using a local JSON file as the database.",
            contact: {
                name: "API Support",
                email: "support@example.com",
            },
        },
        servers: [
            {
                url: "http://localhost:3000",
                description: "Local Development Server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                },
            },
            schemas: {
                User: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            example: "a1b2c3d4-e5f6-7890-ab12-cd34ef567890",
                        },
                        name: {
                            type: "string",
                            example: "Alice Johnson",
                        },
                        email: {
                            type: "string",
                            format: "email",
                            example: "alice@example.com",
                        },
                        age: {
                            type: "integer",
                            example: 28,
                        },
                    },
                    required: ["id", "name", "email", "age"],
                },

                CreateUserInput: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "Charlie Brown" },
                        email: { type: "string", format: "email", example: "charlie@example.com" },
                        age: { type: "integer", example: 25 },
                    },
                    required: ["name", "email", "age"],
                },

                UpdateUserInput: {
                    type: "object",
                    properties: {
                        name: { type: "string", example: "Charlie Updated" },
                        email: { type: "string", format: "email", example: "charlie_new@example.com" },
                        age: { type: "integer", example: 26 },
                    },
                },

                Task: {
                    type: "object",
                    properties: {
                        task_id: { type: "string", example: "T_1617845567123" },
                        title: { type: "string", example: "Finish API docs" },
                        status: { type: "string", enum: ["Pending", "In Progress", "Done"], example: "Pending" },
                        created_at: { type: "string", format: "date-time", example: "2024-01-01T12:00:00Z" },
                    },
                    required: ["task_id", "title", "status", "created_at"],
                },

                CreateTaskInput: {
                    type: "object",
                    properties: {
                        title: { type: "string", example: "Finish API docs" },
                        status: { type: "string", enum: ["Pending", "In Progress", "Done"], example: "Pending" },
                        taskId: { type: "string", example: "T_1617845567123" },
                    },
                    required: ["title"],
                },

                UpdateTaskStatusInput: {
                    type: "object",
                    properties: {
                        status: { type: "string", enum: ["Pending", "In Progress", "Done"], example: "In Progress" },
                    },
                    required: ["status"],
                },

                SyncTasksInput: {
                    type: "object",
                    properties: {
                        tasks: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Task",
                            },
                        },
                        deletedTaskIds: {
                            type: "array",
                            items: {
                                type: "string",
                            },
                            description: "IDs of tasks deleted client-side (optional)",
                        },
                    },
                    required: ["tasks"],
                },

                SyncTasksResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "Sync completed" },
                        tasks: {
                            type: "array",
                            items: {
                                $ref: "#/components/schemas/Task",
                            },
                        },
                    },
                },

                ErrorResponse: {
                    type: "object",
                    properties: {
                        message: { type: "string", example: "User not found" },
                    },
                },
            },
        },
    },
    // Scan these files for JSDoc @swagger annotations
    apis: ["./src/routes/*.ts"],
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
