import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoApprovalFixedDepositsAccountComponent } from './undo-approval-fixed-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('UndoApprovalFixedDepositsAccountComponent', () => {
  let component: UndoApprovalFixedDepositsAccountComponent;
  let fixture: ComponentFixture<UndoApprovalFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UndoApprovalFixedDepositsAccountComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoApprovalFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
