import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanProductCurrencyStepComponent } from './loan-product-currency-step.component';

describe('LoanProductCurrencyStepComponent', () => {
  let component: LoanProductCurrencyStepComponent;
  let fixture: ComponentFixture<LoanProductCurrencyStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductCurrencyStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
