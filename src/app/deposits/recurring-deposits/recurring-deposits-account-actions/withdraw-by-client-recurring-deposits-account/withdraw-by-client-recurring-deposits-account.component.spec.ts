import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WithdrawByClientRecurringDepositsAccountComponent } from './withdraw-by-client-recurring-deposits-account.component';

describe('WithdrawByClientRecurringDepositsAccountComponent', () => {
  let component: WithdrawByClientRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<WithdrawByClientRecurringDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawByClientRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawByClientRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
