import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskManagementComponent } from './task-management.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('TaskManagementComponent', () => {
  let component: TaskManagementComponent;
  let fixture: ComponentFixture<TaskManagementComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [TaskManagementComponent],
      imports: [TranslateModule],
      providers: [TranslateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TaskManagementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
