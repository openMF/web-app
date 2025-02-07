import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountActionsComponent } from './recurring-deposits-account-actions.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('RecurringDepositsAccountActionsComponent', () => {
  let component: RecurringDepositsAccountActionsComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountActionsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountActionsComponent],
      imports: [RouterTestingModule]
    }).compileComponents();
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
