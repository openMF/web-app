import { Component, Input, OnInit } from '@angular/core';
import { PaymentDetail } from './payment-detail-model';


@Component({
  selector: 'mifosx-transaction-payment-detail',
  templateUrl: './transaction-payment-detail.component.html',
  styleUrls: ['./transaction-payment-detail.component.scss']
})
export class TransactionPaymentDetailComponent implements OnInit {

  @Input() paymentDetailData: PaymentDetail;

  constructor() {}

  ngOnInit(): void {}

}
