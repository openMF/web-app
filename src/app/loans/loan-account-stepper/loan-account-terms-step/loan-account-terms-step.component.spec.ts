import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAccountTermsStepComponent } from './loan-account-terms-step.component';

describe('LoanAccountTermsStepComponent', () => {
  let component: LoanAccountTermsStepComponent;
  let fixture: ComponentFixture<LoanAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanAccountTermsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
