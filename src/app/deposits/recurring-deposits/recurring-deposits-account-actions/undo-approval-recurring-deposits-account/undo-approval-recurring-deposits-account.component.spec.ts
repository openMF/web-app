import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoApprovalRecurringDepositsAccountComponent } from './undo-approval-recurring-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';

describe('UndoApprovalRecurringDepositsAccountComponent', () => {
  let component: UndoApprovalRecurringDepositsAccountComponent;
  let fixture: ComponentFixture<UndoApprovalRecurringDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UndoApprovalRecurringDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule
      ]
    }).compileComponents();
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
