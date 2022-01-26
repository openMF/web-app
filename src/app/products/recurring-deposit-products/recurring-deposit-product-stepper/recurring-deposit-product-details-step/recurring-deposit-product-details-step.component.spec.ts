import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositProductDetailsStepComponent } from './recurring-deposit-product-details-step.component';

describe('RecurringDepositProductDetailsStepComponent', () => {
  let component: RecurringDepositProductDetailsStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductDetailsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositProductDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
