import { Component, Input } from '@angular/core';
import { PaymentDetail } from './payment-detail-model';


@Component({
  selector: 'mifosx-transaction-payment-detail',
  templateUrl: './transaction-payment-detail.component.html',
  styleUrls: ['./transaction-payment-detail.component.scss']
})
export class TransactionPaymentDetailComponent {

  @Input() paymentDetailData: PaymentDetail;

  constructor() {}

  hasSomeValue(): boolean {
    return (
      this.isNotNullOrEmpty(this.paymentDetailData.accountNumber) ||
      this.isNotNullOrEmpty(this.paymentDetailData.bankNumber) ||
      this.isNotNullOrEmpty(this.paymentDetailData.checkNumber) ||
      this.isNotNullOrEmpty(this.paymentDetailData.receiptNumber) ||
      this.isNotNullOrEmpty(this.paymentDetailData.routingCode)
    );
  }

  isNotNullOrEmpty(value: any): boolean {
    return (value !== null && value !== '');
  }

}
