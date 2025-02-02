import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountDetailsStepComponent } from './fixed-deposit-account-details-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('FixedDepositAccountDetailsStepComponent', () => {
  let component: FixedDepositAccountDetailsStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositAccountDetailsStepComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
