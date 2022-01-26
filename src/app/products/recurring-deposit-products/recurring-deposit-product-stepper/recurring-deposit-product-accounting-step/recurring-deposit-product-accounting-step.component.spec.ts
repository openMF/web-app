import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositProductAccountingStepComponent } from './recurring-deposit-product-accounting-step.component';

describe('RecurringDepositProductAccountingStepComponent', () => {
  let component: RecurringDepositProductAccountingStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductAccountingStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositProductAccountingStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
