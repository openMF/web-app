import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositsAccountActionsComponent } from './recurring-deposits-account-actions.component';

describe('RecurringDepositsAccountActionsComponent', () => {
  let component: RecurringDepositsAccountActionsComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositsAccountActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
