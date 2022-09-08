import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowJobsComponent } from './workflow-job.component';

describe('WorkflowJobsComponent', () => {
  let component: WorkflowJobsComponent;
  let fixture: ComponentFixture<WorkflowJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WorkflowJobsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WorkflowJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
