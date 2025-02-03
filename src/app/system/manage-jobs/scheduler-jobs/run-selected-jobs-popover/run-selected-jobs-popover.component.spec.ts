import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RunSelectedJobsPopoverComponent } from './run-selected-jobs-popover.component';
import { HttpClientModule } from '@angular/common/http';
import { MatDialogModule } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';

describe('RunSelectedJobsPopoverComponent', () => {
  let component: RunSelectedJobsPopoverComponent;
  let fixture: ComponentFixture<RunSelectedJobsPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RunSelectedJobsPopoverComponent],
      imports: [
        HttpClientModule,
        MatDialogModule,
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RunSelectedJobsPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
