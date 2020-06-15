/** Angular Imports */
import { Component, Input, Output, EventEmitter } from '@angular/core';

/**
 * Shares account preview step
 */
@Component({
  selector: 'mifosx-shares-account-preview-step',
  templateUrl: './shares-account-preview-step.component.html',
  styleUrls: ['./shares-account-preview-step.component.scss']
})
export class SharesAccountPreviewStepComponent {

  /** Shares Account Product Template */
  @Input() sharesAccountProductTemplate: any;
  /** Shares Account Template */
  @Input() sharesAccountTemplate: any;
  /** Shares Account Terms Form */
  @Input() sharesAccountTermsForm: any;
  /** Shares Account */
  @Input() sharesAccount: any;

  /** Display columns for charges table. */
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];

  /** Form submission event */
  @Output() submit = new EventEmitter();

  constructor() { }

}
