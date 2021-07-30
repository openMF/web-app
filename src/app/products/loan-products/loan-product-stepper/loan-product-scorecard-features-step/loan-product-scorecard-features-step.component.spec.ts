import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductScorecardFeaturesStepComponent } from './loan-product-scorecard-features-step.component';

describe('LoanProductScorecardFeaturesStepComponent', () => {
  let component: LoanProductScorecardFeaturesStepComponent;
  let fixture: ComponentFixture<LoanProductScorecardFeaturesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductScorecardFeaturesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductScorecardFeaturesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
