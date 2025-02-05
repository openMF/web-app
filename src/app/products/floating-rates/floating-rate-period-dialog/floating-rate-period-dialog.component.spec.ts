import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FloatingRatePeriodDialogComponent } from './floating-rate-period-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('FloatingRatePeriodDialogComponent', () => {
  let component: FloatingRatePeriodDialogComponent;
  let fixture: ComponentFixture<FloatingRatePeriodDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FloatingRatePeriodDialogComponent],
      imports: [MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FloatingRatePeriodDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
