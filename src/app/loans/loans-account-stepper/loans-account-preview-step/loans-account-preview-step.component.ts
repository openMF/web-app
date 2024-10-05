/** Angular Imports */
import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

/**
 * Create Loans Account Preview Step
 */
@Component({
  selector: 'mifosx-loans-account-preview-step',
  templateUrl: './loans-account-preview-step.component.html',
  styleUrls: ['./loans-account-preview-step.component.scss']
})
export class LoansAccountPreviewStepComponent implements OnChanges {

  /** Loans Account Template */
  @Input() loansAccountTemplate: any = [];
  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Data */
  @Input() loansAccount: any;
  /** Submit Loans Account */
  @Output() submitEvent = new EventEmitter();

  /** Charges Displayed Columns */
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'date'];
  /** Overdue Charges Displayed Columns */
  overdueChargesDisplayedColumns: string[] = ['name', 'type', 'amount', 'collectedon'];

  productEnableDownPayment = false;

  constructor() { }

  ngOnChanges(changes: SimpleChanges): void {
    this.productEnableDownPayment = this.loansAccountProductTemplate.product.enableDownPayment;
  }

}
