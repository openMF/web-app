import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanAccountChargesStepComponent } from './loan-account-charges-step.component';

describe('LoanAccountChargesStepComponent', () => {
  let component: LoanAccountChargesStepComponent;
  let fixture: ComponentFixture<LoanAccountChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanAccountChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
