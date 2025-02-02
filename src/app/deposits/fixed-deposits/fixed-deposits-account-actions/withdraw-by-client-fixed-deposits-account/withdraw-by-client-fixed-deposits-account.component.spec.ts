import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WithdrawByClientFixedDepositsAccountComponent } from './withdraw-by-client-fixed-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('WithdrawByClientFixedDepositsAccountComponent', () => {
  let component: WithdrawByClientFixedDepositsAccountComponent;
  let fixture: ComponentFixture<WithdrawByClientFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WithdrawByClientFixedDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
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
