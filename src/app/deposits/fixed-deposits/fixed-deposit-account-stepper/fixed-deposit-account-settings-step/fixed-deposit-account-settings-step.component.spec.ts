import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositAccountSettingsStepComponent } from './fixed-deposit-account-settings-step.component';

describe('FixedDepositAccountSettingsStepComponent', () => {
  let component: FixedDepositAccountSettingsStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountSettingsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountSettingsStepComponent ]
    })
    .compileComponents();
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
