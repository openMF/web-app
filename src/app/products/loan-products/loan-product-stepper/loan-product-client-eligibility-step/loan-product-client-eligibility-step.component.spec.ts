import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductClientEligibilityStepComponent } from './loan-product-client-eligibility-step.component';

describe('LoanProductClientEligibilityStepComponent', () => {
  let component: LoanProductClientEligibilityStepComponent;
  let fixture: ComponentFixture<LoanProductClientEligibilityStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductClientEligibilityStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductClientEligibilityStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
