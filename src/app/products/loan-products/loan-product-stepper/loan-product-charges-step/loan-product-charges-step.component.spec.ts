import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { LoanProductChargesStepComponent } from './loan-product-charges-step.component';

describe('LoanProductChargesStepComponent', () => {
  let component: LoanProductChargesStepComponent;
  let fixture: ComponentFixture<LoanProductChargesStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProductChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
