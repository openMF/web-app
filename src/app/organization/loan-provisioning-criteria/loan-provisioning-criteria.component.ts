/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/**
 * Loan Provisioning Criteria component.
 */
@Component({
  selector: 'mifosx-loan-provisioning-criteria',
  templateUrl: './loan-provisioning-criteria.component.html',
  styleUrls: ['./loan-provisioning-criteria.component.scss']
})
export class LoanProvisioningCriteriaComponent implements OnInit {

  /** Loan Provisioning Criteria data. */
  loanProvisioningCriteriaData: any;
  /** Columns to be displayed in loan provisioning criteria table. */
  displayedColumns: string[] = ['criteriaName', 'createdBy'];
  /** Data source for loan provisioning criteria table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for loan provisioning criteria table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for loan provisioning criteria table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the loan provisioning criteria data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { loanProvisioningCriterias: any }) => {
      this.loanProvisioningCriteriaData = data.loanProvisioningCriterias;
    });
  }

  /**
   * Filters data in loan provisioning criteria table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the loan provisioning criteria table.
   */
  ngOnInit() {
    this.setLoanProvisioningCriteria();
  }

  /**
   * Initializes the data source, paginator and sorter for loan provisioning criteria table.
   */
  setLoanProvisioningCriteria() {
    this.dataSource = new MatTableDataSource(this.loanProvisioningCriteriaData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

}
