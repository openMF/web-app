import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductInterestRateChartStepComponent } from './recurring-deposit-product-interest-rate-chart-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';

describe('RecurringDepositProductInterestRateChartStepComponent', () => {
  let component: RecurringDepositProductInterestRateChartStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductInterestRateChartStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositProductInterestRateChartStepComponent],
      imports: [
        ReactiveFormsModule,
        CommonModule,
        MatDialogModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductInterestRateChartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
