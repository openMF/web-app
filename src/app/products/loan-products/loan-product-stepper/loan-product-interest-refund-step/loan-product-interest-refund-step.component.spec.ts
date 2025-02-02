import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductInterestRefundStepComponent } from './loan-product-interest-refund-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('LoanProductInterestRefundStepComponent', () => {
  let component: LoanProductInterestRefundStepComponent;
  let fixture: ComponentFixture<LoanProductInterestRefundStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanProductInterestRefundStepComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductInterestRefundStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
