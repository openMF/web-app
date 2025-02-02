import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountSettingsStepComponent } from './fixed-deposit-account-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

describe('FixedDepositAccountSettingsStepComponent', () => {
  let component: FixedDepositAccountSettingsStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositAccountSettingsStepComponent],
      imports: [
        ReactiveFormsModule,
        CommonModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
