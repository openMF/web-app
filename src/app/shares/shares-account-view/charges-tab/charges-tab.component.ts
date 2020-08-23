/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/**
 * Charges Tab Component
 */
@Component({
  selector: 'mifosx-charges-tab',
  templateUrl: './charges-tab.component.html',
  styleUrls: ['./charges-tab.component.scss']
})
export class ChargesTabComponent implements OnInit {

  /** Shares Account Data */
  sharesAccountData: any;
  /** Charges Data */
  chargesData: any[];
  /** Data source for charges table. */
  dataSource: MatTableDataSource<any>;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = [
    'name',
    'feeOrPenalty',
    'paymentDueAt',
    'calculationType',
    'due',
    'paid',
    'waived',
    'outstanding',
  ];

  /**
   * Retrieves shares account aata from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { sharesAccountData: any }) => {
      this.sharesAccountData = data.sharesAccountData;
      this.chargesData = this.sharesAccountData.charges;
    });
  }

  ngOnInit() {
    const activeCharges = this.chargesData ? this.chargesData.filter(charge => charge.isActive) : [];
    this.dataSource = new MatTableDataSource(activeCharges);
  }

}
