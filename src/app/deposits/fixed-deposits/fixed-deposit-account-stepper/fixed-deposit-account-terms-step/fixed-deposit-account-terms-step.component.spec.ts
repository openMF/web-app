import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountTermsStepComponent } from './fixed-deposit-account-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

describe('FixedDepositAccountTermsStepComponent', () => {
  let component: FixedDepositAccountTermsStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositAccountTermsStepComponent],
      imports: [ReactiveFormsModule],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
