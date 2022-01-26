import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanAccountActionsComponent } from './loan-account-actions.component';

describe('LoanAccountActionsComponent', () => {
  let component: LoanAccountActionsComponent;
  let fixture: ComponentFixture<LoanAccountActionsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanAccountActionsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAccountActionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
