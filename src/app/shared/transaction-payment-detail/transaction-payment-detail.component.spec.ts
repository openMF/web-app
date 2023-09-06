import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionPaymentDetailComponent } from './transaction-payment-detail.component';

describe('TransactionPaymentDetailComponent', () => {
  let component: TransactionPaymentDetailComponent;
  let fixture: ComponentFixture<TransactionPaymentDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TransactionPaymentDetailComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionPaymentDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
