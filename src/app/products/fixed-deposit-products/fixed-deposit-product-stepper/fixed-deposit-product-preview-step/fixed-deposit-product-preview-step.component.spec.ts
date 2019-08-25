import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductPreviewStepComponent } from './fixed-deposit-product-preview-step.component';

describe('FixedDepositProductPreviewStepComponent', () => {
  let component: FixedDepositProductPreviewStepComponent;
  let fixture: ComponentFixture<FixedDepositProductPreviewStepComponent>;

  beforeEach(async(() => {
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
