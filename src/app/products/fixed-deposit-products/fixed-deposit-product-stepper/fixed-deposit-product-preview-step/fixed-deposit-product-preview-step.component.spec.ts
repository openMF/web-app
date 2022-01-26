import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositProductPreviewStepComponent } from './fixed-deposit-product-preview-step.component';

describe('FixedDepositProductPreviewStepComponent', () => {
  let component: FixedDepositProductPreviewStepComponent;
  let fixture: ComponentFixture<FixedDepositProductPreviewStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductPreviewStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
