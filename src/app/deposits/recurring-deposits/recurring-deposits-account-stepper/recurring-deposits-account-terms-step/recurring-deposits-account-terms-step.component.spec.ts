import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountTermsStepComponent } from './recurring-deposits-account-terms-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';

describe('RecurringDepositsAccountTermsStepComponent', () => {
  let component: RecurringDepositsAccountTermsStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountTermsStepComponent],
      imports: [ReactiveFormsModule],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountTermsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
