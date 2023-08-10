import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-loan-collateral-tab',
  templateUrl: './loan-collateral-tab.component.html',
  styleUrls: ['./loan-collateral-tab.component.scss']
})
export class LoanCollateralTabComponent implements OnInit {

  /** Loan Collateral Details */
  loanCollaterals: any[] = [];
  /** Columns to be displayed in collateral table. */
  displayedColumns: string[] = ['id', 'currency', 'description', 'total'];

  totalAmount: number;

  /**
   * Retrieves the loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loanCollaterals: any }) => {
      this.loanCollaterals = data.loanCollaterals;
    });
  }

  ngOnInit() {
    this.totalAmount = 0;
    this.loanCollaterals.forEach((collateral: any) => {
      this.totalAmount = this.totalAmount + collateral.value;
    });
  }

}
