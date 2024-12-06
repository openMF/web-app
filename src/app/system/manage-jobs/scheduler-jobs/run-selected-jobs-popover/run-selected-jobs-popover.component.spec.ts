import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunSelectedJobsPopoverComponent } from './run-selected-jobs-popover.component';

describe('RunSelectedJobsPopoverComponent', () => {
  let component: RunSelectedJobsPopoverComponent;
  let fixture: ComponentFixture<RunSelectedJobsPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RunSelectedJobsPopoverComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RunSelectedJobsPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
