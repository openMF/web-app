import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductInterestRateChartStepComponent } from './fixed-deposit-product-interest-rate-chart-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';

describe('FixedDepositProductInterestRateChartStepComponent', () => {
  let component: FixedDepositProductInterestRateChartStepComponent;
  let fixture: ComponentFixture<FixedDepositProductInterestRateChartStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositProductInterestRateChartStepComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule
      ],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductInterestRateChartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
