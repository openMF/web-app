import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

@Component({
  selector: 'mifosx-loan-term-variations-tab',
  templateUrl: './loan-term-variations-tab.component.html',
  styleUrls: ['./loan-term-variations-tab.component.scss']
})
export class LoanTermVariationsTabComponent {

  /** Loan Term Variation Data */
  loanTermVariationsData: any[] = [];
  loanDTermVariationsColumns: string[] = ['termType', 'applicableFrom', 'value', 'specificToInstallment'];
  /** Interest Pauses Data */
  interestPausesData: any[] = [];
  interestPausesColumns: string[] = ['row', 'startDate', 'endDate', 'days'];

  constructor(private route: ActivatedRoute,
    private dates: Dates
  ) {
    this.interestPausesData = [];
    this.route.data.subscribe((data: { loanDetailsData: any, interestPausesData: any }) => {
      this.loanTermVariationsData = data.loanDetailsData.loanTermVariations;
      this.interestPausesData = [];
      data.interestPausesData?.forEach((item: any) => {
        item.days = dates.calculateDiff(new Date(item.startDate), new Date(item.endDate));
        this.interestPausesData.push(item);
      });
    });
  }
}
