import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewFixedDepositProductComponent } from './view-fixed-deposit-product.component';

describe('ViewFixedDepositProductComponent', () => {
  let component: ViewFixedDepositProductComponent;
  let fixture: ComponentFixture<ViewFixedDepositProductComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewFixedDepositProductComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewFixedDepositProductComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
