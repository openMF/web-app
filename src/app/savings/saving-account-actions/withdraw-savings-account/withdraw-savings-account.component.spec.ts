import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawSavingsAccountComponent } from './withdraw-savings-account.component';

describe('WithdrawSavingsAccountComponent', () => {
  let component: WithdrawSavingsAccountComponent;
  let fixture: ComponentFixture<WithdrawSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WithdrawSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WithdrawSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
