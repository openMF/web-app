import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { WithdrawByClientSavingsAccountComponent } from './withdraw-by-client-savings-account.component';

describe('WithdrawByClientSavingsAccountComponent', () => {
  let component: WithdrawByClientSavingsAccountComponent;
  let fixture: ComponentFixture<WithdrawByClientSavingsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawByClientSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawByClientSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
