import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageSchedulerJobsComponent } from './manage-scheduler-jobs.component';

describe('ManageSchedulerJobsComponent', () => {
  let component: ManageSchedulerJobsComponent;
  let fixture: ComponentFixture<ManageSchedulerJobsComponent>;

  beforeEach(async(() => {
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
