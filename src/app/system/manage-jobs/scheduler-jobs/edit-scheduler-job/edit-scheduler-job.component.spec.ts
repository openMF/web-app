import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSchedulerJobComponent } from './edit-scheduler-job.component';

describe('EditSchedulerJobComponent', () => {
  let component: EditSchedulerJobComponent;
  let fixture: ComponentFixture<EditSchedulerJobComponent>;

  beforeEach(async(() => {
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
