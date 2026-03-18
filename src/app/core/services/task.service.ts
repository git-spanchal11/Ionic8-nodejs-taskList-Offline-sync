import { Injectable } from '@angular/core';
import { Observable, catchError, from, of, tap, firstValueFrom } from 'rxjs';
import { NetworkService } from './network.service';
import { StorageService } from './storage.service';
import { HttpService } from './http.service';
import { environment } from '../../../environments/environment';
export interface Task {
  taskId: string;
  title: string;
  status: 'Pending' | 'In Progress' | 'Done';
  createdAt?: string;
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
    private http: HttpService,
    private networkService: NetworkService,
    private storageService: StorageService
  ) { }

  getTasks(): Observable<Task[]> {
    if (this.networkService.currentStatus) {
      return this.http.get<Task[]>(`${environment.apiUrl}/tasks`).pipe(
        tap(tasks => this.storageService.set(this.TASKS_KEY, tasks)),
        catchError((err) => {
          console.error('Failed to grab live tasks API, falling back to cache:', err);
          return from(this.getCachedTasks());
        })
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
      try {
        await firstValueFrom(this.http.put(`${environment.apiUrl}/tasks/${taskId}/status`, { status: newStatus }));
        console.log(`Live Update: Task ${taskId} status changed to ${newStatus}`);
      } catch (err) {
        console.error('Error on live update, queueing offline fallback:', err);
        await this.queueSyncAction({ action: 'UPDATE', taskId, payload: { status: newStatus }, timestamp: Date.now() });
      }
    } else {
      await this.queueSyncAction({ action: 'UPDATE', taskId, payload: { status: newStatus }, timestamp: Date.now() });
    }
  }

  async addTask(title: string): Promise<Task> {
    const tempTaskId = 'T_' + new Date().getTime().toString();
    const newTask: Task = {
      taskId: tempTaskId,
      title,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    const tasks = await this.getCachedTasks();
    await this.storageService.set(this.TASKS_KEY, [...tasks, newTask]);

    if (this.networkService.currentStatus) {
      try {
        const response = await firstValueFrom<{ task_id: string }>(this.http.post<any>(`${environment.apiUrl}/tasks`, { taskId: tempTaskId, title, status: 'Pending' }));
        console.log(`Live Add: Task ${response.task_id} created`);
      } catch (err) {
        console.error('Error on live add, queueing offline fallback:', err);
        await this.queueSyncAction({ action: 'ADD', taskId: tempTaskId, payload: newTask, timestamp: Date.now() });
      }
    } else {
      await this.queueSyncAction({ action: 'ADD', taskId: tempTaskId, payload: newTask, timestamp: Date.now() });
    }
    return newTask;
  }

  async deleteTask(taskId: string): Promise<void> {
    const tasks = await this.getCachedTasks();
    const updatedTasks = tasks.filter(t => t.taskId !== taskId);
    await this.storageService.set(this.TASKS_KEY, updatedTasks);

    if (this.networkService.currentStatus) {
      try {
        await firstValueFrom(this.http.delete(`${environment.apiUrl}/tasks/${taskId}`));
        console.log(`Live Delete: Task ${taskId} deleted`);
      } catch (err) {
        console.error('Error on live delete, queueing offline fallback:', err);
        await this.queueSyncAction({ action: 'DELETE', taskId, timestamp: Date.now() });
      }
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

  async executeSyncAction(action: SyncAction): Promise<void> {
    try {
      if (action.action === 'ADD' && action.payload) {
        await firstValueFrom(this.http.post<any>(`${environment.apiUrl}/tasks`, {
          taskId: action.taskId,
          title: action.payload.title,
          status: action.payload.status || 'Pending'
        }));
      } else if (action.action === 'UPDATE' && action.payload) {
        await firstValueFrom(this.http.put(`${environment.apiUrl}/tasks/${action.taskId}/status`, {
          status: action.payload.status
        }));
      } else if (action.action === 'DELETE') {
        await firstValueFrom(this.http.delete(`${environment.apiUrl}/tasks/${action.taskId}`));
      }
    } catch (err) {
      console.error(`Failed to execute sync action ${action.action} for ${action.taskId}`, err);
    }
  }

  /**
   * Batch Sync Method
   * Ideally, this calls a SINGLE endpoint like POST /tasks/sync
   * For the current setup, we will implement the logic that SHOULD be a single call,
   * but provide a fallback if the backend hasn't implemented it yet.
   */
  async batchSync(tasks: SyncAction[], onProgress: (percentage: number) => void): Promise<void> {
    // If we assume a batch endpoint exists (Backend change required):
    try {
      await firstValueFrom(this.http.post(`${environment.apiUrl}/tasks/sync`, { tasks }));
      onProgress(100);
      return;
    } catch (err) {
      console.warn('Batch endpoint not found, falling back to sequential...');
    }

    // Fallback: Optimized sequential calls to stay compatible with current backend 
    let count = 0;
    for (const action of tasks) {
      await this.executeSyncAction(action);
      count++;
      onProgress(Math.round((count / tasks.length) * 100));
      // Artificial delay for UI visibility
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
}
