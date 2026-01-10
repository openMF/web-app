/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import {
  MatTableDataSource,
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/** Dialog Component */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

import { LoanProduct } from 'app/products/loan-products/models/loan-product.model';

/**
 * View Loan Provisioning
 */
@Component({
  selector: 'mifosx-view-loan-provisioning-criteria',
  templateUrl: './view-loan-provisioning-criteria.component.html',
  styleUrls: ['./view-loan-provisioning-criteria.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatDivider,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow
  ]
})
export class ViewLoanProvisioningCriteriaComponent implements OnInit {
  private organizationService = inject(OrganizationService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  dialog = inject(MatDialog);

  /** Loan Provisioning data. */
  provisioningData: any;
  /** Loan Product String. */
  loanProducts = '';
  /** Column Headers for Mat Table. */
  displayedColumns: string[] = [
    'category',
    'minAge',
    'maxAge',
    'percentage',
    'liabilityAccount',
    'expenseAccount'
  ];
  /** Data source for loan provisioning criteria table. */
  dataSource: MatTableDataSource<any>;

  /**
   * Retrieves the Provisioning data from `resolve`.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog Dialog reference.
   */
  constructor() {
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

    // Get loan products as a comma-separated string, no trailing comma, with type safety
    if (this.provisioningData.loanProducts && this.provisioningData.loanProducts.length > 0) {
      this.loanProducts = (this.provisioningData.loanProducts as LoanProduct[])
        .filter((p) => p && p.name)
        .map((p) => p.name)
        .join(', ');
    } else {
      this.loanProducts = '';
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
        this.organizationService.deleteProvisioningCriteria(this.provisioningData.criteriaId).subscribe(
          () => {
            this.router.navigate(['/organization/provisioning-criteria']);
          },
          (error) => {
            console.error('Failed to delete provisioning criteria:', error);
          }
        );
      }
    });
  }
}
