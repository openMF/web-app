import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositProductsComponent } from './fixed-deposit-products.component';

describe('FixedDepositProductsComponent', () => {
  let component: FixedDepositProductsComponent;
  let fixture: ComponentFixture<FixedDepositProductsComponent>;

  beforeEach(async(() => {
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
