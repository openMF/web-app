import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-loan-collateral-tab',
  templateUrl: './loan-collateral-tab.component.html',
  styleUrls: ['./loan-collateral-tab.component.scss']
})
export class LoanCollateralTabComponent implements OnInit {

  /** Loan Details */
  loanDetails: any;
  /** Columns to be displayed in collateral table. */
  displayedColumns: string[] = ['type', 'value', 'description'];

  /**
   * Retrieves the loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loanDetailsAssociationData: any }) => {
      this.loanDetails = data.loanDetailsAssociationData;
    });
  }

  ngOnInit() {
  }

}
