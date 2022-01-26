import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FixedDepositProductsComponent } from './fixed-deposit-products.component';

describe('FixedDepositProductsComponent', () => {
  let component: FixedDepositProductsComponent;
  let fixture: ComponentFixture<FixedDepositProductsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FixedDepositProductsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
