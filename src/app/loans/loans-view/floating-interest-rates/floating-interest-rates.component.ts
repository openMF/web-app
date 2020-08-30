import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-floating-interest-rates',
  templateUrl: './floating-interest-rates.component.html',
  styleUrls: ['./floating-interest-rates.component.scss']
})
export class FloatingInterestRatesComponent implements OnInit {

  /** Loan Details */
  loanDetails: any;
  /** Interest Rate Data */
  interestRateData: any;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = ['fromDate', 'interestRate'];

  /**
   * Retrieves the loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe(( data: { loanDetailsData: any }) => {
      this.loanDetails = data.loanDetailsData;
    });
  }

  ngOnInit() {
    this.interestRateData = this.loanDetails.interestRatesPeriods;
  }

}
