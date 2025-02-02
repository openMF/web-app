import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UndoApprovalSavingsAccountComponent } from './undo-approval-savings-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('UndoApprovalSavingsAccountComponent', () => {
  let component: UndoApprovalSavingsAccountComponent;
  let fixture: ComponentFixture<UndoApprovalSavingsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UndoApprovalSavingsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
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
