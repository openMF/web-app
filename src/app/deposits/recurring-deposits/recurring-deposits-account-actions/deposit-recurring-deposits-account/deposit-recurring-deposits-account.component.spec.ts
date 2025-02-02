import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DepositRecurringDepositsAccountComponent } from './deposit-recurring-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';

describe('DepositRecurringDepositsAccountComponent', () => {
  let component: DepositRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<DepositRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DepositRecurringDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule
      ]
    }).compileComponents();
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
