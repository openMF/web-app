import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAccountDetailsStepComponent } from './loan-account-details-step.component';

describe('LoanAccountDetailsStepComponent', () => {
  let component: LoanAccountDetailsStepComponent;
  let fixture: ComponentFixture<LoanAccountDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanAccountDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAccountDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
