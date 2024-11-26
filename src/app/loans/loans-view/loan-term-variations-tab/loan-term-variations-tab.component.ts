import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-loan-term-variations-tab',
  templateUrl: './loan-term-variations-tab.component.html',
  styleUrls: ['./loan-term-variations-tab.component.scss']
})
export class LoanTermVariationsTabComponent {

  /** Loan Details Data */
  loanTermVariationsData: any[] = [];

  loanId: number;

  loanDTermVariationsColumns: string[] = ['termType', 'applicableFrom', 'value', 'specificToInstallment'];

  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDetailsData: any, }) => {
      this.loanTermVariationsData = data.loanDetailsData.loanTermVariations;
    });
    this.loanId = this.route.parent.parent.snapshot.params['loanId'];
  }
}
