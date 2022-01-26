import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UndoApprovalSharesAccountComponent } from './undo-approval-shares-account.component';

describe('UndoApprovalSharesAccountComponent', () => {
  let component: UndoApprovalSharesAccountComponent;
  let fixture: ComponentFixture<UndoApprovalSharesAccountComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoApprovalSharesAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoApprovalSharesAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
