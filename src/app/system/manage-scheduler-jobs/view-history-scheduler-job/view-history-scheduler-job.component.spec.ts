import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewHistorySchedulerJobComponent } from './view-history-scheduler-job.component';

describe('ViewHistorySchedulerJobComponent', () => {
  let component: ViewHistorySchedulerJobComponent;
  let fixture: ComponentFixture<ViewHistorySchedulerJobComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewHistorySchedulerJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewHistorySchedulerJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
