import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunSelectedJobsTableComponent } from './run-selected-jobs-table.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RunSelectedJobsTableComponent', () => {
  let component: RunSelectedJobsTableComponent;
  let fixture: ComponentFixture<RunSelectedJobsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunSelectedJobsTableComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RunSelectedJobsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
