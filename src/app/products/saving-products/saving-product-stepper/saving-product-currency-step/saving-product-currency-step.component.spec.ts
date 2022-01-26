import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingProductCurrencyStepComponent } from './saving-product-currency-step.component';

describe('SavingProductCurrencyStepComponent', () => {
  let component: SavingProductCurrencyStepComponent;
  let fixture: ComponentFixture<SavingProductCurrencyStepComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductCurrencyStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductCurrencyStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
