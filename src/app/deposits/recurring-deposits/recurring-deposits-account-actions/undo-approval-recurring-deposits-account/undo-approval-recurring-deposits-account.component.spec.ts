import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UndoApprovalRecurringDepositsAccountComponent } from './undo-approval-recurring-deposits-account.component';

describe('UndoApprovalRecurringDepositsAccountComponent', () => {
  let component: UndoApprovalRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<UndoApprovalRecurringDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoApprovalRecurringDepositsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoApprovalRecurringDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
