import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositConfirmationDialogComponent } from './recurring-deposit-confirmation-dialog.component';

describe('RecurringDepositConfirmationDialogComponent', () => {
  let component: RecurringDepositConfirmationDialogComponent;
  let fixture: ComponentFixture<RecurringDepositConfirmationDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositConfirmationDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositConfirmationDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
