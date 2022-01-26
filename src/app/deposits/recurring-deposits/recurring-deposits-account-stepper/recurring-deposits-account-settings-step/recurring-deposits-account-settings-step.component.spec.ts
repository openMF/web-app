import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { RecurringDepositsAccountSettingsStepComponent } from './recurring-deposits-account-settings-step.component';

describe('RecurringDepositsAccountSettingsStepComponent', () => {
  let component: RecurringDepositsAccountSettingsStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountSettingsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ RecurringDepositsAccountSettingsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
