import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountSettingsStepComponent } from './recurring-deposits-account-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('RecurringDepositsAccountSettingsStepComponent', () => {
  let component: RecurringDepositsAccountSettingsStepComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountSettingsStepComponent],
      imports: [
        ReactiveFormsModule,
        CommonModule
      ]
    }).compileComponents();
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
