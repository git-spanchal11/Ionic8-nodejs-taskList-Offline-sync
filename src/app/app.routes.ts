import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  {
    path: 'tasks',
    canActivate: [authGuard],
    loadComponent: () => import('./pages/task-list/task-list.page').then(m => m.TaskListPage)
  },
  {
    path: '',
    redirectTo: 'tasks',
    pathMatch: 'full',
  },
];
