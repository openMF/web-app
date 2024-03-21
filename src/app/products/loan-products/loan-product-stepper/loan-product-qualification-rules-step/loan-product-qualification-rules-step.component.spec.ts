import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductQualificationRulesStepComponent } from './loan-product-qualification-rules-step.component';

describe('LoanProductQualificationRulesStepComponent', () => {
  let component: LoanProductQualificationRulesStepComponent;
  let fixture: ComponentFixture<LoanProductQualificationRulesStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductQualificationRulesStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductQualificationRulesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
