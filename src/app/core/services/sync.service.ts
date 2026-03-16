import { Injectable } from '@angular/core';
import { NetworkService } from './network.service';
import { TaskService } from './task.service';

@Injectable({
  providedIn: 'root'
})
export class SyncService {
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
    const queue = await this.taskService.getSyncQueue();
    if (queue.length > 0) {
      console.log(`Syncing ${queue.length} offline updates to backend...`);
      for (const item of queue) {
        if (item.action === 'ADD') {
           console.log(`Syncing item: ADD Task ${item.taskId}`);
        } else if (item.action === 'UPDATE') {
           console.log(`Syncing item: UPDATE Task ${item.taskId} -> ${item.payload?.status}`);
        } else if (item.action === 'DELETE') {
           console.log(`Syncing item: DELETE Task ${item.taskId}`);
        }
        
        // Simulate network delay for sync
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      await this.taskService.clearSyncQueue();
      console.log('Sync complete.');
    }
  }
}
