import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountTermsStepComponent } from './recurring-deposits-account-terms-step.component';

describe('RecurringDepositsAccountTermsStepComponent', () => {
  let component: RecurringDepositsAccountTermsStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountTermsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositsAccountTermsStepComponent ]
    })
    .compileComponents();
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
