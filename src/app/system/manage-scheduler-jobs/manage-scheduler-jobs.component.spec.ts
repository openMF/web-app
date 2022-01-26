import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageSchedulerJobsComponent } from './manage-scheduler-jobs.component';

describe('ManageSchedulerJobsComponent', () => {
  let component: ManageSchedulerJobsComponent;
  let fixture: ComponentFixture<ManageSchedulerJobsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageSchedulerJobsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageSchedulerJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
