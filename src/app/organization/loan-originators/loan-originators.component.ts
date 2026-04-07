/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
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
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanOriginator } from 'app/loans/models/loan-account.model';
import { OrganizationService } from '../organization.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconButton } from '@angular/material/button';
import { ExternalIdentifierComponent } from 'app/shared/external-identifier/external-identifier.component';

/**
 * Loan Originators component.
 */
@Component({
  selector: 'mifosx-loan-originators',
  templateUrl: './loan-originators.component.html',
  styleUrl: './loan-originators.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    MatIconButton,
    ExternalIdentifierComponent
  ]
})
export class LoanOriginatorsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private organizationService = inject(OrganizationService);
  private translateService = inject(TranslateService);
  private dialog = inject(MatDialog);

  /** Loan Originators data. */
  loanOriginatorsData: LoanOriginator[] = [];
  /** Columns to be displayed in Loan Originators table. */
  displayedColumns: string[] = [
    'id',
    'name',
    'externalId',
    'status',
    'originatorType',
    'channelType',
    'actions'
  ];
  /** Data source for Loan Originators table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for Loan Originators table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for Loan Originators table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of Loan Originators table */
  @ViewChild('tableLoanOriginators') tableLoanOriginators: ElementRef<any>;
  /* Template for popover on Loan Originators table */
  @ViewChild('templateTableLoanOriginators') templateTableLoanOriginators: TemplateRef<any>;

  constructor() {
    this.route.data.subscribe((data: { loanOriginatorsData: LoanOriginator[] }) => {
      this.loanOriginatorsData = data.loanOriginatorsData;
    });
  }

  /**
   * Filters data in Loan Originators table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the Loan Originators table.
   */
  ngOnInit() {
    this.setLoanOriginators();
  }

  /**
   * Initializes the data source, paginator and sorter for Loan Originators table.
   */
  setLoanOriginators() {
    this.dataSource = new MatTableDataSource(this.loanOriginatorsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  deleteLoanOriginator(loanOriginator: LoanOriginator): void {
    const deleteCodeDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext: this.translateService.instant('labels.inputs.Loan Originator') + ' ' + loanOriginator.name
      }
    });
    deleteCodeDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteLoanOriginator(loanOriginator.id).subscribe(() => {
          this.router.navigate(['/organization/manage-loan-originators']);
        });
      }
    });
  }

  classStatus(currentStatus: string): string {
    if (currentStatus === 'ACTIVE') {
      return 'status-active';
    } else if (currentStatus === 'PENDING') {
      return 'status-pending';
    } else if (currentStatus === 'INACTIVE') {
      return 'status-inactive';
    }
    return '';
  }
}
