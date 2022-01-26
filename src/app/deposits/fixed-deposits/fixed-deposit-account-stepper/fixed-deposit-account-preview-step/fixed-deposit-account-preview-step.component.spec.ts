import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositAccountPreviewStepComponent } from './fixed-deposit-account-preview-step.component';

describe('FixedDepositAccountPreviewStepComponent', () => {
  let component: FixedDepositAccountPreviewStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountPreviewStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositAccountPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
