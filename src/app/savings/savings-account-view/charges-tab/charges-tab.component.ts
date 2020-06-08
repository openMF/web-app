/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatTable } from '@angular/material';
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

  /** Savings Account Data */
  savingsAccountData: any;
  /** Charges Data */
  chargesData: any[];
  /** Data source for charges table. */
  dataSource: MatTableDataSource<any>;
  /** Toggles Charges Table */
  showInactiveCharges = false;
  /** Columns to be displayed in charges table. */
  displayedColumns: string[] = [
    'name',
    'feeOrPenalty',
    'paymentDueAt',
    'dueAsOf',
    'repeatsOn',
    'calculationType',
    'due',
    'paid',
    'waived',
    'outstanding',
    'actions'
  ];

  /** Charges Table Reference */
  @ViewChild('chargesTable') chargesTableRef: MatTable<Element>;

  /**
   * Retrieves Savings Account Data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { savingsAccountData: any }) => {
      this.savingsAccountData = data.savingsAccountData;
      this.chargesData = this.savingsAccountData.charges;
    });
  }

  ngOnInit() {
    const activeCharges = this.chargesData ? this.chargesData.filter(charge => charge.isActive) : [];
    this.dataSource = new MatTableDataSource(activeCharges);
  }

  /**
   * Toggles datasource for active/inactive charges.
   */
  toggleCharges() {
    this.showInactiveCharges = !this.showInactiveCharges;
    if (!this.showInactiveCharges) {
      const activeCharges = this.chargesData.filter(charge => charge.isActive);
      this.dataSource.data = activeCharges;
    } else {
      const inActiveCharges = this.chargesData.filter(charge => !charge.isActive);
      this.dataSource.data = inActiveCharges;
    }
    this.chargesTableRef.renderRows();
  }

  /**
   * Checks if charge is recurring.
   * @param {any} charge Charge
   */
  isRecurringCharge(charge: any) {
    return charge.chargeTimeType.value === 'Monthly Fee' || charge.chargeTimeType.value === 'Annual Fee' || charge.chargeTimeType.value === 'Weekly Fee';
  }

}
