import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductDetailsStepComponent } from './loan-product-details-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('LoanProductDetailsStepComponent', () => {
  let component: LoanProductDetailsStepComponent;
  let fixture: ComponentFixture<LoanProductDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanProductDetailsStepComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
