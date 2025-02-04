import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountInterestRateChartStepComponent } from './recurring-deposits-account-interest-rate-chart-step.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('RecurringDepositsAccountInterestRateChartStepComponent', () => {
  let component: RecurringDepositsAccountInterestRateChartStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountInterestRateChartStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountInterestRateChartStepComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountInterestRateChartStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
