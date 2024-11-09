import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'mifosx-glim-preview-step',
  templateUrl: './glim-preview-step.component.html',
  styleUrls: ['./glim-preview-step.component.scss']
})
export class GlimPreviewStepComponent {


  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
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

  constructor() { }

}
