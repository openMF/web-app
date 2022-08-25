import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'mifosx-glim-preview-step',
  templateUrl: './glim-preview-step.component.html',
  styleUrls: ['./glim-preview-step.component.scss']
})
export class GlimPreviewStepComponent implements OnInit {


  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Data */
  @Input() loansAccount: any;
  /** Submit Loans Account */
  @Output() submit = new EventEmitter();

  /** Charges Displayed Columns */
  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType', 'date'];
  /** Overdue Charges Displayed Columns */
  overdueChargesDisplayedColumns: string[] = ['name', 'type', 'amount', 'collectedon'];

  constructor() { }

  ngOnInit(): void {
  }

}
