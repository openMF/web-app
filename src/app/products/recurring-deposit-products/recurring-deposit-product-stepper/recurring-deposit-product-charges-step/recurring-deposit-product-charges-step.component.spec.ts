import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositProductChargesStepComponent } from './recurring-deposit-product-charges-step.component';

describe('RecurringDepositProductChargesStepComponent', () => {
  let component: RecurringDepositProductChargesStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductChargesStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositProductChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
