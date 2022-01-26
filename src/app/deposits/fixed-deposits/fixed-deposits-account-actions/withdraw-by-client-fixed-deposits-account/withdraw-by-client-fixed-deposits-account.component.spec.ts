import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WithdrawByClientFixedDepositsAccountComponent } from './withdraw-by-client-fixed-deposits-account.component';

describe('WithdrawByClientFixedDepositsAccountComponent', () => {
  let component: WithdrawByClientFixedDepositsAccountComponent;
  let fixture: ComponentFixture<WithdrawByClientFixedDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawByClientFixedDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawByClientFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
