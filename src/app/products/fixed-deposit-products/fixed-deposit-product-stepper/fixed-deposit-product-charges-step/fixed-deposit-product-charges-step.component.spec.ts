import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductChargesStepComponent } from './fixed-deposit-product-charges-step.component';

describe('FixedDepositProductChargesStepComponent', () => {
  let component: FixedDepositProductChargesStepComponent;
  let fixture: ComponentFixture<FixedDepositProductChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductChargesStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
