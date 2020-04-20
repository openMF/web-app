import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'mifosx-loan-account-preview-step',
  templateUrl: './loan-account-preview-step.component.html',
  styleUrls: ['./loan-account-preview-step.component.scss']
})
export class LoanAccountPreviewStepComponent implements OnInit {
  @Input() loanAccount: any;
  @Input() loanAccountInfo: any;
  @Output() submit = new EventEmitter();

  chargesDisplayedColumns: string[] = ['name', 'chargeCalculationType', 'amount', 'chargeTimeType'];

  constructor() {}

  ngOnInit() {}
}
