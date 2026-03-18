export interface User {
    id: string;
    name: string;
    email: string;
    age: number;
}

export type CreateUserInput = Omit<User, "id">;
export type UpdateUserInput = Partial<CreateUserInput>;
