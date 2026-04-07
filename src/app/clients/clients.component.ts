/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, Sort, MatSortHeader } from '@angular/material/sort';
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
import { environment } from '../../environments/environment';
import { ClientsService } from './clients.service';
import { NgClass } from '@angular/common';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatProgressBar } from '@angular/material/progress-bar';
import { AccountNumberComponent } from '../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../shared/external-identifier/external-identifier.component';
import { StatusLookupPipe } from '../pipes/status-lookup.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-clients',
  templateUrl: './clients.component.html',
  styleUrls: ['./clients.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    FaIconComponent,
    MatProgressBar,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    AccountNumberComponent,
    ExternalIdentifierComponent,
    NgClass,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    StatusLookupPipe
  ]
})
export class ClientsComponent implements OnInit {
  private clientService = inject(ClientsService);

  /** Returns true if client data masking is enabled */
  get hideClientData(): boolean {
    return environment.complianceHideClientData;
  }

  /** Mask a client name */
  maskName(name: string): string {
    if (!name) return '';
    return name
      .split(' ')
      .map((part) => (part.length > 1 ? part[0] + '*'.repeat(part.length - 1) : part))
      .join(' ');
  }

  @ViewChild('showClosedAccounts') showClosedAccounts: MatCheckbox;

  displayedColumns = [
    'displayName',
    'accountNumber',
    'externalId',
    'status',
    'officeName'
  ];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  existsClientsToFilter = false;
  notExistsClientsToFilter = false;

  totalRows: number;
  isLoading = false;

  pageSize = 50;
  currentPage = 0;
  filterText = '';

  sortAttribute = '';
  sortDirection = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  ngOnInit() {
    if (environment.preloadClients) {
      this.getClients();
    }
  }

  /**
   * Searches server for query and resource.
   */
  search(value: string) {
    this.filterText = value;
    this.resetPaginator();
    this.getClients();
  }

  private getClients() {
    this.isLoading = true;
    this.clientService
      .searchByText(this.filterText, this.currentPage, this.pageSize, this.sortAttribute, this.sortDirection)
      .subscribe(
        (data: any) => {
          this.dataSource.data = data.content;

          this.totalRows = data.totalElements;

          this.existsClientsToFilter = data.numberOfElements > 0;
          this.notExistsClientsToFilter = !this.existsClientsToFilter;
          this.isLoading = false;
        },
        (error: any) => {
          this.isLoading = false;
        }
      );
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.getClients();
  }

  sortChanged(event: Sort) {
    if (event.direction === '') {
      this.sortDirection = '';
      this.sortAttribute = '';
    } else {
      this.sortAttribute = event.active;
      this.sortDirection = event.direction;
    }
    this.resetPaginator();
    this.getClients();
  }

  private resetPaginator() {
    this.currentPage = 0;
    this.paginator.firstPage();
  }
}
