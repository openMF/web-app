import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositRecurringDepositsAccountComponent } from './deposit-recurring-deposits-account.component';

describe('DepositRecurringDepositsAccountComponent', () => {
  let component: DepositRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<DepositRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DepositRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DepositRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
