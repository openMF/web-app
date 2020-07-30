import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductTermsStepComponent } from './recurring-deposit-product-terms-step.component';

describe('RecurringDepositProductTermsStepComponent', () => {
  let component: RecurringDepositProductTermsStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositProductTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
