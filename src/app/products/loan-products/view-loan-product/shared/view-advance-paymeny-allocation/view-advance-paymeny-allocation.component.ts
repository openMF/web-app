import { Component, Input, OnInit } from '@angular/core';
import { PaymentAllocation } from 'app/products/loan-products/loan-product-stepper/loan-product-payment-strategy-step/payment-allocation-model';

@Component({
  selector: 'mifosx-view-advance-paymeny-allocation',
  templateUrl: './view-advance-paymeny-allocation.component.html',
  styleUrls: ['./view-advance-paymeny-allocation.component.scss']
})
export class ViewAdvancePaymenyAllocationComponent implements OnInit {

  @Input() paymentAllocation: PaymentAllocation;

  constructor() { }

  ngOnInit(): void {
  }

}
