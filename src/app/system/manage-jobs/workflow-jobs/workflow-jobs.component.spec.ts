import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WorkflowJobsComponent } from './workflow-jobs.component';
import { HttpClientModule } from '@angular/common/http';

describe('WorkflowJobsComponent', () => {
  let component: WorkflowJobsComponent;
  let fixture: ComponentFixture<WorkflowJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [WorkflowJobsComponent],
      imports: [HttpClientModule]
    }).compileComponents();
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
