import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountInterestRateChartStepComponent } from './fixed-deposit-account-interest-rate-chart-step.component';
import { TranslateModule } from '@ngx-translate/core';

describe('FixedDepositAccountInterestRateChartStepComponent', () => {
  let component: FixedDepositAccountInterestRateChartStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountInterestRateChartStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositAccountInterestRateChartStepComponent],
      imports: [TranslateModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountInterestRateChartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
