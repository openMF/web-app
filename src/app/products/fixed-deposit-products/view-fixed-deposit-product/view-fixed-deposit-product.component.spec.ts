import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFixedDepositProductComponent } from './view-fixed-deposit-product.component';

describe('ViewFixedDepositProductComponent', () => {
  let component: ViewFixedDepositProductComponent;
  let fixture: ComponentFixture<ViewFixedDepositProductComponent>;

  beforeEach(async(() => {
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
