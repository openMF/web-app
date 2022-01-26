import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { AddChargeRecurringDepositsAccountComponent } from './add-charge-recurring-deposits-account.component';

describe('AddChargeRecurringDepositsAccountComponent', () => {
  let component: AddChargeRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<AddChargeRecurringDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AddChargeRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddChargeRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
