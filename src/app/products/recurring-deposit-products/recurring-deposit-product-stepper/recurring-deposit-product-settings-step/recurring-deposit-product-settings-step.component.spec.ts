import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositProductSettingsStepComponent } from './recurring-deposit-product-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

describe('RecurringDepositProductSettingsStepComponent', () => {
  let component: RecurringDepositProductSettingsStepComponent;
  let fixture: ComponentFixture<RecurringDepositProductSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositProductSettingsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositProductSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
