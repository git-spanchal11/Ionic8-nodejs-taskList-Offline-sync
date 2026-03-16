import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, from, of, tap } from 'rxjs';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';

export interface Task {
  taskId: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Done';
  createdAt?: string;
  isDeleted?: boolean; // Used for local soft deletion before sync
}

export interface SyncAction {
  action: 'ADD' | 'UPDATE' | 'DELETE';
  taskId: string;
  payload?: any;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class TaskService {
  private readonly TASKS_KEY = 'cached_tasks';
  private readonly SYNC_QUEUE_KEY = 'sync_queue';

  constructor(
    private http: HttpClient,
    private networkService: NetworkService,
    private storageService: StorageService
  ) {}

  getTasks(): Observable<Task[]> {
    if (this.networkService.currentStatus) {
      return this.http.get<Task[]>('assets/mock-tasks.json').pipe(
        tap(tasks => this.storageService.set(this.TASKS_KEY, tasks)),
        catchError(() => from(this.getCachedTasks()))
      );
    } else {
      return from(this.getCachedTasks());
    }
  }

  async getCachedTasks(): Promise<Task[]> {
    const tasks = await this.storageService.get(this.TASKS_KEY);
    return tasks || [];
  }

  async updateTaskStatus(taskId: string, newStatus: 'Pending' | 'In Progress' | 'Done'): Promise<void> {
    const tasks = await this.getCachedTasks();
    const updatedTasks = tasks.map(t => t.taskId === taskId ? { ...t, status: newStatus } : t);
    await this.storageService.set(this.TASKS_KEY, updatedTasks);

    if (this.networkService.currentStatus) {
      console.log(`Live Update: Task ${taskId} status changed to ${newStatus}`);
    } else {
      await this.queueSyncAction({ action: 'UPDATE', taskId, payload: { status: newStatus }, timestamp: Date.now() });
    }
  }

  async addTask(title: string): Promise<Task> {
    const newTask: Task = {
      taskId: 'T_' + new Date().getTime().toString(),
      title,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const tasks = await this.getCachedTasks();
    await this.storageService.set(this.TASKS_KEY, [...tasks, newTask]);

    if (this.networkService.currentStatus) {
      console.log(`Live Add: Task ${newTask.taskId} created`);
    } else {
      await this.queueSyncAction({ action: 'ADD', taskId: newTask.taskId, payload: newTask, timestamp: Date.now() });
    }
    return newTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getCachedTasks();
    const updatedTasks = tasks.filter(t => t.taskId !== taskId);
    await this.storageService.set(this.TASKS_KEY, updatedTasks);

    if (this.networkService.currentStatus) {
      console.log(`Live Delete: Task ${taskId} deleted`);
    } else {
      await this.queueSyncAction({ action: 'DELETE', taskId, timestamp: Date.now() });
    }
  }

  private async queueSyncAction(action: SyncAction) {
    const queue = await this.getSyncQueue();
    queue.push(action);
    await this.storageService.set(this.SYNC_QUEUE_KEY, queue);
    console.log(`Offline: Queued ${action.action} for task ${action.taskId}`);
  }

  async getSyncQueue(): Promise<SyncAction[]> {
    const queue = await this.storageService.get(this.SYNC_QUEUE_KEY);
    return queue || [];
  }
  
  async clearSyncQueue(): Promise<void> {
    await this.storageService.remove(this.SYNC_QUEUE_KEY);
  }
}
