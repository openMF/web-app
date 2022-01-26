import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositProductSettingsStepComponent } from './fixed-deposit-product-settings-step.component';

describe('FixedDepositProductSettingsStepComponent', () => {
  let component: FixedDepositProductSettingsStepComponent;
  let fixture: ComponentFixture<FixedDepositProductSettingsStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductSettingsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
