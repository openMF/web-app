import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSchedulerJobComponent } from './view-scheduler-job.component';

describe('ViewSchedulerJobComponent', () => {
  let component: ViewSchedulerJobComponent;
  let fixture: ComponentFixture<ViewSchedulerJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSchedulerJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSchedulerJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
