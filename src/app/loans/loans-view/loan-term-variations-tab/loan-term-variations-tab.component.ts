import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-loan-term-variations-tab',
  templateUrl: './loan-term-variations-tab.component.html',
  styleUrls: ['./loan-term-variations-tab.component.scss']
})
export class LoanTermVariationsTabComponent {

  /** Loan Term Variation Data */
  loanTermVariationsData: any[] = [];
  loanTermVariationsColumns: string[] = ['row', 'id', 'startDate', 'endDate'];

  constructor(private route: ActivatedRoute) {
    this.loanTermVariationsData = [];
    this.route.data.subscribe((data: { loanTermVariationsData: any, }) => {
      this.loanTermVariationsData = data.loanTermVariationsData;
    });
  }
}
