import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskListPage } from './task-list.page';
import { TaskService } from '../../core/services/task.service';
import { NetworkService } from '../../core/services/network.service';
import { SyncService } from '../../core/services/sync.service';
import { ActionSheetController, AlertController } from '@ionic/angular';
import { of, BehaviorSubject } from 'rxjs';

describe('TaskListPage', () => {
  let component: TaskListPage;
  let fixture: ComponentFixture<TaskListPage>;
  let taskServiceMock: any;
  let networkServiceMock: any;
  let syncServiceMock: any;
  let actionSheetCtrlMock: any;
  let alertCtrlMock: any;

  beforeEach(async () => {
    taskServiceMock = {
      getTasks: jasmine.createSpy('getTasks').and.returnValue(of([])),
      getSyncQueue: jasmine.createSpy('getSyncQueue').and.returnValue(Promise.resolve([])),
      getCachedTasks: jasmine.createSpy('getCachedTasks').and.returnValue(Promise.resolve([])),
      updateTaskStatus: jasmine.createSpy('updateTaskStatus').and.returnValue(Promise.resolve()),
      addTask: jasmine.createSpy('addTask').and.returnValue(Promise.resolve({ taskId: '1', title: 'New Task', status: 'Pending' })),
      deleteTask: jasmine.createSpy('deleteTask').and.returnValue(Promise.resolve())
    };

    networkServiceMock = {
      currentStatus: true,
      isOnline$: new BehaviorSubject<boolean>(true)
    };

    syncServiceMock = {
      syncProgress$: new BehaviorSubject<any>({ active: false, percentage: 0 })
    };

    actionSheetCtrlMock = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: jasmine.createSpy('present')
      }))
    };

    alertCtrlMock = {
      create: jasmine.createSpy('create').and.returnValue(Promise.resolve({
        present: jasmine.createSpy('present')
      }))
    };

    await TestBed.configureTestingModule({
      imports: [TaskListPage],
      providers: [
        { provide: TaskService, useValue: taskServiceMock },
        { provide: NetworkService, useValue: networkServiceMock },
        { provide: SyncService, useValue: syncServiceMock },
        { provide: ActionSheetController, useValue: actionSheetCtrlMock },
        { provide: AlertController, useValue: alertCtrlMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load tasks on init', () => {
    const mockTasks = [{ taskId: '1', title: 'Test Task', status: 'Pending' }];
    taskServiceMock.getTasks.and.returnValue(of(mockTasks));

    component.ngOnInit();

    expect(taskServiceMock.getTasks).toHaveBeenCalled();
  });

  it('should call addTask and update list', fakeAsync(() => {
    let newTask = { taskId: 'T_123', title: 'New task', status: 'Pending' };
    taskServiceMock.addTask.and.returnValue(Promise.resolve(newTask));

    component.addTask('New task');
    tick();

    expect(taskServiceMock.addTask).toHaveBeenCalledWith('New task');
  }));

  it('should call deleteTask and update list', fakeAsync(() => {
    component.tasks = [{ taskId: '1', title: 'Task 1', status: 'Pending' }];

    component.deleteTask('1');
    tick();

    expect(taskServiceMock.deleteTask).toHaveBeenCalledWith('1');
    expect(component.tasks.length).toBe(0);
  }));

  it('should update task status', fakeAsync(() => {
    const task = { taskId: '1', title: 'Task 1', status: 'Pending' } as any;
    component.tasks = [task];

    component.updateStatus(task, 'In Progress');
    tick();

    expect(taskServiceMock.updateTaskStatus).toHaveBeenCalledWith('1', 'In Progress');
    expect(task.status).toBe('In Progress');
  }));

  it('should show action sheet on task click', fakeAsync(() => {
    const task = { taskId: '1', title: 'Task 1', status: 'Pending' } as any;

    component.onTaskStatusClick(task);
    tick();

    expect(actionSheetCtrlMock.create).toHaveBeenCalled();
  }));

  it('should show alert on prompt add task', fakeAsync(() => {
    component.promptAddTask();
    tick();

    expect(alertCtrlMock.create).toHaveBeenCalled();
  }));
});
