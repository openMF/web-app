import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanCreditBalanceRefundComponent } from './loan-credit-balance-refund.component';

describe('LoanCreditBalanceRefundComponent', () => {
  let component: LoanCreditBalanceRefundComponent;
  let fixture: ComponentFixture<LoanCreditBalanceRefundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanCreditBalanceRefundComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanCreditBalanceRefundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
