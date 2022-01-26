import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditSchedulerJobComponent } from './edit-scheduler-job.component';

describe('EditSchedulerJobComponent', () => {
  let component: EditSchedulerJobComponent;
  let fixture: ComponentFixture<EditSchedulerJobComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditSchedulerJobComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditSchedulerJobComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
