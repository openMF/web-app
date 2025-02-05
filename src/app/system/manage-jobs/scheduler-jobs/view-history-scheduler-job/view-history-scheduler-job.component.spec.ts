import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewHistorySchedulerJobComponent } from './view-history-scheduler-job.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogRef } from '@angular/material/dialog';

describe('ViewHistorySchedulerJobComponent', () => {
  let component: ViewHistorySchedulerJobComponent;
  let fixture: ComponentFixture<ViewHistorySchedulerJobComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewHistorySchedulerJobComponent],
      imports: [RouterTestingModule],
      providers: [
        { provide: MatDialogRef, useValue: {} }]
    }).compileComponents();
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
