import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-task-management',
  templateUrl: './task-management.component.html',
  styleUrls: ['./task-management.component.scss']
})
export class TaskManagementComponent implements OnInit {
  tasks: Array<any>;

  constructor() {
    this.tasks = [];
  }

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    // logic to load tasks
  }
}
