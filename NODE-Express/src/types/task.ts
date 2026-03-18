export interface Task {
    task_id: string;
    title: string;
    status: "Pending" | "In Progress" | "Done";
    created_at: string;
}

export type CreateTaskInput = {
    title: string;
    status?: Task["status"];
    taskId?: string;
};

export type UpdateTaskStatusInput = {
    status: Task["status"];
};
