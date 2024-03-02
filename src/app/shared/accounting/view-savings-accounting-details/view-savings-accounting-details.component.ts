import { Component, Input, OnInit } from '@angular/core';
import { Accounting } from 'app/core/utils/accounting';
import { OptionData } from 'app/shared/models/option-data.model';

@Component({
  selector: 'mifosx-view-savings-accounting-details',
  templateUrl: './view-savings-accounting-details.component.html',
  styleUrls: ['./view-savings-accounting-details.component.scss']
})
export class ViewSavingsAccountingDetailsComponent implements OnInit {

  @Input() accountingRule: OptionData;
  @Input() accountingMappings: any[] = [];

  constructor(private accounting: Accounting) { }

  ngOnInit(): void {
  }

  isCashOrAccrualAccounting(): boolean {
    return this.accounting.isCashOrAccrualAccounting(this.accountingRule);
  }

  isAccrualAccounting(): boolean {
    return this.accounting.isAccrualAccounting(this.accountingRule);
  }

}
