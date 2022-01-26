import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositsAccountChargesStepComponent } from './recurring-deposits-account-charges-step.component';

describe('RecurringDepositsAccountChargesStepComponent', () => {
  let component: RecurringDepositsAccountChargesStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountChargesStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositsAccountChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
