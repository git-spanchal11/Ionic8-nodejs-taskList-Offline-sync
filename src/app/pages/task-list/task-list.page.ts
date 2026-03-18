import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, ActionSheetController, AlertController } from '@ionic/angular';
import { TaskService, Task } from '../../core/services/task.service';
import { NetworkService } from '../../core/services/network.service';
import { SyncService } from '../../core/services/sync.service';
import { TaskItemComponent } from '../../shared/components/task-item/task-item.component';
import { addIcons } from 'ionicons';
import { syncOutline, wifiOutline, addOutline, trashOutline, timeOutline, constructOutline, checkmarkCircleOutline, closeOutline } from 'ionicons/icons';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.page.html',
  standalone: true,
  imports: [CommonModule, IonicModule, TaskItemComponent]
})
export class TaskListPage implements OnInit {
  private taskService = inject(TaskService);
  public networkService = inject(NetworkService);
  public syncService = inject(SyncService);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);

  tasks: Task[] = [];
  syncQueueIds: Set<string> = new Set();

  constructor() {
    addIcons({ syncOutline, wifiOutline, addOutline, trashOutline, timeOutline, constructOutline, checkmarkCircleOutline, closeOutline });
  }

  ngOnInit() {
    this.loadTasks();
    // Periodically check queue to update UI sync status
    setInterval(() => this.checkSyncQueue(), 2000);
  }

  /**
   * Loads the initial list of tasks from the service.
   */
  loadTasks() {
    this.taskService.getTasks().subscribe({
      next: (tasks) => this.tasks = tasks,
      error: (err) => console.error('Error loading tasks', err)
    });
  }

  /**
   * Checks the offline queue to update internal state for UI sync indicators.
   */
  async checkSyncQueue() {
    const queue = await this.taskService.getSyncQueue();
    this.syncQueueIds = new Set(queue.map(q => q.taskId));
    // Reload tasks silently to reflect any background sync completions
    const currentTasks = await this.taskService.getCachedTasks();
    if (currentTasks && currentTasks.length > 0) {
      this.tasks = currentTasks;
    }
  }

  /**
   * Opens the management action sheet for a specific task.
   */
  async onTaskStatusClick(task: Task) {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Manage Task',
      buttons: [
        { text: 'Pending', icon: 'time-outline', handler: () => this.updateStatus(task, 'Pending') },
        { text: 'In Progress', icon: 'construct-outline', handler: () => this.updateStatus(task, 'In Progress') },
        { text: 'Done', icon: 'checkmark-circle-outline', handler: () => this.updateStatus(task, 'Done') },
        { text: 'Delete', role: 'destructive', icon: 'trash-outline', handler: () => this.deleteTask(task.taskId) },
        { text: 'Cancel', role: 'cancel', icon: 'close-outline' }
      ]
    });
    await actionSheet.present();
  }

  /**
   * Updates the status of a task and notifies the service.
   */
  async updateStatus(task: Task, newStatus: 'Pending' | 'In Progress' | 'Done') {
    if (task.status === newStatus) return;

    const index = this.tasks.findIndex(t => t.taskId === task.taskId);
    if (index > -1) {
      this.tasks[index].status = newStatus;
    }

    await this.taskService.updateTaskStatus(task.taskId, newStatus);
    this.checkSyncQueue();
  }

  /**
   * Displays the alert prompt for adding a new task.
   */
  async promptAddTask() {
    const alert = await this.alertCtrl.create({
      header: 'New Task',
      inputs: [
        { name: 'title', type: 'text', placeholder: 'Task Title' }
      ],
      buttons: [
        { text: 'Cancel', role: 'cancel' },
        {
          text: 'Add',
          handler: (data) => {
            if (data.title && data.title.trim().length > 0) {
              this.addTask(data.title.trim());
            }
          }
        }
      ]
    });
    await alert.present();
  }

  /**
   * Adds a new task to the collection and stays in sync with the backend.
   */
  async addTask(title: string) {
    const newTask = await this.taskService.addTask(title);
    this.tasks.push(newTask);
    this.checkSyncQueue();
  }

  /**
   * Removes a task and updates the backend.
   */
  async deleteTask(taskId: string) {
    this.tasks = this.tasks.filter(t => t.taskId !== taskId);
    await this.taskService.deleteTask(taskId);
    this.checkSyncQueue();
  }
}
