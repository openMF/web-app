import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoApprovalSavingsAccountComponent } from './undo-approval-savings-account.component';

describe('UndoApprovalSavingsAccountComponent', () => {
  let component: UndoApprovalSavingsAccountComponent;
  let fixture: ComponentFixture<UndoApprovalSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UndoApprovalSavingsAccountComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UndoApprovalSavingsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
