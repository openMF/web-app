import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ApproveRecurringDepositsAccountComponent } from './approve-recurring-deposits-account.component';

describe('ApproveRecurringDepositsAccountComponent', () => {
  let component: ApproveRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<ApproveRecurringDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ApproveRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApproveRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
