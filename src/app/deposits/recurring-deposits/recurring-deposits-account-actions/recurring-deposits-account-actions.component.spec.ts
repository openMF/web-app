import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountActionsComponent } from './recurring-deposits-account-actions.component';

describe('RecurringDepositsAccountActionsComponent', () => {
  let component: RecurringDepositsAccountActionsComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountActionsComponent>;

  beforeEach(async(() => {
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
