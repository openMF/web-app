export interface PaymentType {
  id: number;
  isSystemDefined: boolean;
  name: string;
}

export interface PaymentDetail {
  paymentType: PaymentType;
  accountNumber: string;
  checkNumber: string;
  routingCode: string;
  receiptNumber: string;
  bankNumber: string;
}
