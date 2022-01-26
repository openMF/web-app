import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UndoApprovalFixedDepositsAccountComponent } from './undo-approval-fixed-deposits-account.component';

describe('UndoApprovalFixedDepositsAccountComponent', () => {
  let component: UndoApprovalFixedDepositsAccountComponent;
  let fixture: ComponentFixture<UndoApprovalFixedDepositsAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoApprovalFixedDepositsAccountComponent ]
    })
    .compileComponents();
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
