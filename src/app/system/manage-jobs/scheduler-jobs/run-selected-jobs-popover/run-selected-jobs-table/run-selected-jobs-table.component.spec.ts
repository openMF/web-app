import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunSelectedJobsTableComponent } from './run-selected-jobs-table.component';

describe('RunSelectedJobsTableComponent', () => {
  let component: RunSelectedJobsTableComponent;
  let fixture: ComponentFixture<RunSelectedJobsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunSelectedJobsTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(RunSelectedJobsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
