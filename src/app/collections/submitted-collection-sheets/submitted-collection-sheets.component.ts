/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';

import { CollectionsService } from '../collections.service';
import { DatePipe, CurrencyPipe } from '@angular/common';

import { MatCard, MatCardContent } from '@angular/material/card';
import {
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
import { MatButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { MatFabButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'mifosx-submitted-collection-sheets',
  templateUrl: './submitted-collection-sheets.component.html',
  styleUrls: ['./submitted-collection-sheets.component.scss'],
  imports: [
    MatCard,
    MatCardContent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatButton,
    MatIcon,
    MatFabButton,
    MatTooltip,
    MatProgressSpinner,
    MatPaginator,
    FaIconComponent,
    DatePipe,
    CurrencyPipe,
    CommonModule
  ]
})
export class SubmittedCollectionSheetsComponent implements OnInit {
  private collectionsService = inject(CollectionsService);
  private router = inject(Router);

  dataSource = new MatTableDataSource<any>();
  displayedColumns: string[] = [
    'id',
    'officeName',
    'centerName',
    'loanOfficerName',
    'meetingDate',
    'status',
    'totalAmount',
    'actions'
  ];
  isLoading = true;

  // Pagination
  totalRecords = 0;
  pageSize = 25;
  pageIndex = 0;
  pageSizeOptions = [
    10,
    25,
    50,
    100
  ];

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngOnInit() {
    this.fetchCollectionSheets();
  }

  fetchCollectionSheets() {
    this.isLoading = true;
    const offset = this.pageIndex * this.pageSize;
    this.collectionsService.getCollectionSheets(offset, this.pageSize).subscribe({
      next: (response: any) => {
        this.totalRecords = response.totalFilteredRecords || 0;
        this.dataSource.data = response.pageItems || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load submitted collection sheets:', err);
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.fetchCollectionSheets();
  }

  viewDetails(sheet: any) {
    this.router.navigate([
      '/collections/sheet-status',
      sheet.id
    ]);
  }
}
