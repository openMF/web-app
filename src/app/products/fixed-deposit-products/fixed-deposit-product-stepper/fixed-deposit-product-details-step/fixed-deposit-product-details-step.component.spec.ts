import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductDetailsStepComponent } from './fixed-deposit-product-details-step.component';

describe('FixedDepositProductDetailsStepComponent', () => {
  let component: FixedDepositProductDetailsStepComponent;
  let fixture: ComponentFixture<FixedDepositProductDetailsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductDetailsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductDetailsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
