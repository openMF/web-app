import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mifosx-saving-product-preview-step',
  templateUrl: './saving-product-preview-step.component.html',
  styleUrls: ['./saving-product-preview-step.component.scss']
})
export class SavingProductPreviewStepComponent implements OnInit {

  @Input() savingProductsTemplate: any;
  @Input() accountingRuleData: any;
  @Input() savingProduct: any;
  @Input() taskPermission: string;
  @Output() submit = new EventEmitter();

  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];
  paymentFundSourceDisplayedColumns: string[] = ['paymentTypeId', 'fundSourceAccountId'];
  feesPenaltyIncomeDisplayedColumns: string[] = ['chargeId', 'incomeAccountId'];

  constructor() { }

  ngOnInit() {
  }

}
