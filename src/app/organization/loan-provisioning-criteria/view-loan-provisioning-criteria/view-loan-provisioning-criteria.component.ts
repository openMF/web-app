/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute } from '@angular/router';
import { MatTableDataSource } from '@angular/material/table';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/** Dialog Component */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/**
 * View Loan Provisioning
 */
@Component({
  selector: 'mifosx-view-loan-provisioning-criteria',
  templateUrl: './view-loan-provisioning-criteria.component.html',
  styleUrls: ['./view-loan-provisioning-criteria.component.scss']
})
export class ViewLoanProvisioningCriteriaComponent implements OnInit {

  /** Loan Provisioning data. */
  provisioningData: any;
  /** Loan Product String. */
  loanProducts = '';
  /** Column Headers for Mat Table. */
  displayedColumns: string[] = ['category', 'minAge', 'maxAge', 'percentage', 'liabilityAccount', 'expenseAccount'];
  /** Data source for loan provisioning criteria table. */
  dataSource: MatTableDataSource<any>;

  /**
   * Retrieves the Provisioning data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor(private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router,
              public dialog: MatDialog) {
      this.route.data.subscribe((data: { loanProvisioningCriteria: any }) => {
        this.provisioningData = data.loanProvisioningCriteria;
    });
  }

  ngOnInit() {
    this.setLoanProvisioningSelectedCriteria();
  }

  /**
   * Initializes the data source, paginator for loan provisioning criteria table.
   */
  setLoanProvisioningSelectedCriteria() {
    this.dataSource = new MatTableDataSource(this.provisioningData.definitions);

     /** Get load products as a string. */
    for (let _id = 0; _id < this.provisioningData.loanProducts.length; _id++) {
      this.loanProducts += this.provisioningData.loanProducts[_id].name + ',';
    }
  }

  /**
   * Delete Selected Provisioning Criteria.
   */
  deleteCriteria() {
    const deleteCriteriaDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Loan Provisioning Criteria id: ${this.provisioningData.criteriaId}` }
    });
    deleteCriteriaDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteProvisioningCriteria(this.provisioningData.criteriaId)
          .subscribe(() => {
            this.router.navigate(['/organization/provisioningcriteria']);
          });
      }
    });
  }

}
