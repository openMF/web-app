import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountSettingsStepComponent } from './recurring-deposits-account-settings-step.component';

describe('RecurringDepositsAccountSettingsStepComponent', () => {
  let component: RecurringDepositsAccountSettingsStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountSettingsStepComponent>;

  beforeEach(async(() => {
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
