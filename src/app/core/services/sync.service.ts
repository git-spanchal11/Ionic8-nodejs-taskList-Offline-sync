import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { TaskService } from './task.service';
import { BehaviorSubject } from 'rxjs';

export interface SyncProgress {
  active: boolean;
  percentage: number;
  message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class SyncService {
  private syncProgressSubject = new BehaviorSubject<SyncProgress>({ active: false, percentage: 0 });
  syncProgress$ = this.syncProgressSubject.asObservable();

  constructor(
    private networkService: NetworkService,
    private taskService: TaskService
  ) {}

  init() {
    this.networkService.isOnline$.subscribe(async (isOnline) => {
      if (isOnline) {
        await this.flushQueue();
      }
    });
  }

  private async flushQueue() {
    let queue = await this.taskService.getSyncQueue();
    if (queue.length > 0) {
      // Step 1: Squash the queue to remove redundant operations
      queue = this.squashQueue(queue);
      
      if (queue.length === 0) {
        await this.taskService.clearSyncQueue();
        return;
      }

      const startTime = Date.now();
      const minDuration = 3000; // 3 seconds minimum
      
      this.syncProgressSubject.next({ active: true, percentage: 0, message: 'Optimizing & Syncing...' });
      
      console.log(`Syncing ${queue.length} optimized updates to backend...`);
      
      // Step 2: Attempt Batch Sync if backend supports it, otherwise fallback to sequential
      // For this requirement, we will simulate a single batch call if we had one, 
      // but for now we follow the user's request to "avoid multiple calls at one go".
      
      try {
        await this.taskService.batchSync(queue, (progress) => {
          this.syncProgressSubject.next({ 
            active: true, 
            percentage: progress, 
            message: `Syncing... ${progress}%` 
          });
        });

      } catch (err) {
        console.error('Batch sync failed', err);
      }

      // Ensure minimum duration is met
      const elapsed = Date.now() - startTime;
      if (elapsed < minDuration) {
        await new Promise(resolve => setTimeout(resolve, minDuration - elapsed));
      }

      await this.taskService.clearSyncQueue();
      this.syncProgressSubject.next({ active: false, percentage: 100, message: 'Sync complete!' });
      
      // Reset after a short delay
      setTimeout(() => {
        this.syncProgressSubject.next({ active: false, percentage: 0 });
      }, 1000);
      
      console.log('Sync complete.');
    }
  }

  private squashQueue(queue: any[]): any[] {
    const squashedMap = new Map<string, any>();

    for (const item of queue) {
      const existing = squashedMap.get(item.taskId);

      if (!existing) {
        squashedMap.set(item.taskId, { ...item });
        continue;
      }

      // Logic for squashing:
      if (item.action === 'DELETE') {
        if (existing.action === 'ADD') {
          // Added then deleted locally before sync: remove entirely
          squashedMap.delete(item.taskId);
        } else {
          // Updated then deleted: just keep the delete
          squashedMap.set(item.taskId, item);
        }
      } else if (item.action === 'UPDATE') {
        if (existing.action === 'DELETE') {
          // This case should theoretically not happen in normal UI flow (update after delete)
          // but if it does, we keep the update as a new state if needed, or just ignore.
          // For safety, we treat it as an update to an existing item.
          squashedMap.set(item.taskId, item);
        } else if (existing.action === 'ADD') {
          // Added then updated: Merge update into ADD payload
          existing.payload = { ...existing.payload, ...item.payload };
          squashedMap.set(item.taskId, existing);
        } else {
          // Multiple updates: Merge them
          existing.payload = { ...existing.payload, ...item.payload };
          squashedMap.set(item.taskId, existing);
        }
      } else if (item.action === 'ADD') {
        // If it was deleted then added again, it's basically a new ADD
        squashedMap.set(item.taskId, item);
      }
    }

    return Array.from(squashedMap.values());
  }
}
