import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanProductTermsStepComponent } from './loan-product-terms-step.component';

describe('LoanProductTermsStepComponent', () => {
  let component: LoanProductTermsStepComponent;
  let fixture: ComponentFixture<LoanProductTermsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
