import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { Task } from '../../../core/services/task.service';

@Component({
  selector: 'app-task-item',
  templateUrl: './task-item.component.html',
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class TaskItemComponent {
  @Input() task!: Task;
  @Input() isSyncing = false;
  @Output() statusClick = new EventEmitter<Task>();

  onStatusClick() {
    this.statusClick.emit(this.task);
  }

  getStatusColor(status: string): string {
    switch(status) {
      case 'Done': return 'success';
      case 'In Progress': return 'warning';
      default: return 'medium';
    }
  }
}
