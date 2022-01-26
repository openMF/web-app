import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanProductDetailsStepComponent } from './loan-product-details-step.component';

describe('LoanProductDetailsStepComponent', () => {
  let component: LoanProductDetailsStepComponent;
  let fixture: ComponentFixture<LoanProductDetailsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
