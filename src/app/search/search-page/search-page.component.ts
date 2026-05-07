/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, ViewChild, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
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
import { Router, ActivatedRoute } from '@angular/router';
import { SearchData } from '../search.model';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ClientsService } from 'app/clients/clients.service';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

/**
 * Search Page Component
 */
@Component({
  selector: 'mifosx-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    ExternalIdentifierComponent,
    MatIconButton,
    MatTooltip,
    FaIconComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class SearchPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private clientsService = inject(ClientsService);
  private readonly entityIdColumnNames = [
    'EntityID',
    'Entity Id',
    'entity_id'
  ];

  /** Flags if number of search results exceed 200 */
  overload: boolean;
  /** Datasource for loans disbursal table */
  dataSource: MatTableDataSource<SearchData>;
  /** Displayed Columns for serach results */
  displayedColumns: string[] = [
    'entityType',
    'entityName',
    'entityAccount',
    'externalId',
    'parentType',
    'parentName',
    'details'
  ];
  /** Paginator for the table */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  hasResults = false;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor() {
    this.route.data.subscribe((data: { searchResults: any }) => {
      const hiddenEntityTypes = [
        'SAVING',
        'SHARE'
      ];
      const searchResults = data.searchResults.filter(
        (result: SearchData) => !hiddenEntityTypes.includes(result.entityType)
      );
      this.overload = searchResults.length > 200 ? true : false;
      const visibleResults = this.overload ? searchResults.slice(0, 200) : searchResults;
      this.dataSource = new MatTableDataSource(visibleResults);
      this.dataSource.paginator = this.paginator;
      this.hasResults = visibleResults.length > 0;
      this.loadClientEntityIds(visibleResults);
    });
  }

  getSearchEntityId(entity: SearchData): string | number {
    if (entity.entityType === 'CLIENT' || entity.entityType === 'CLIENTIDENTIFIER') {
      return entity.entityNumber ?? '';
    }
    return entity.entityNumber ?? entity.entityAccountNo;
  }

  private loadClientEntityIds(searchResults: SearchData[]): void {
    const clientEntityTypes = [
      'CLIENT',
      'CLIENTIDENTIFIER'
    ];
    const clientResults = searchResults.filter((result: SearchData) => clientEntityTypes.includes(result.entityType));

    if (clientResults.length === 0) {
      return;
    }

    this.clientsService
      .getClientDatatables()
      .pipe(catchError(() => of([])))
      .subscribe((clientDatatables: any[]) => {
        const datatableNames = (clientDatatables || [])
          .map((datatable: any) => datatable.registeredTableName)
          .filter((datatableName: string) => !!datatableName);

        if (datatableNames.length === 0) {
          return;
        }

        const entityIdRequests = clientResults.map((result: SearchData) =>
          this.getClientEntityId(this.getClientIdForSearchResult(result), datatableNames)
        );

        forkJoin(entityIdRequests).subscribe((entityIds: Array<string | number | null>) => {
          entityIds.forEach((entityId: string | number | null, index: number) => {
            if (entityId !== null) {
              clientResults[index].entityNumber = entityId;
            }
          });
          this.dataSource.data = [...this.dataSource.data];
        });
      });
  }

  private getClientEntityId(clientId: string, datatableNames: string[]): Observable<string | number | null> {
    if (!clientId) {
      return of(null);
    }

    const datatableRequests = datatableNames.map((datatableName: string) =>
      this.clientsService.getClientDatatable(clientId, datatableName).pipe(catchError(() => of(null)))
    );

    return forkJoin(datatableRequests).pipe(
      map((datatables: any[]) => this.getFirstDatatableColumnValue(datatables, this.entityIdColumnNames)),
      catchError(() => of(null))
    );
  }

  private getFirstDatatableColumnValue(datatables: any[], columnNames: string[]): string | number | null {
    for (const datatable of datatables) {
      const columnValue = this.getDatatableColumnValue(datatable, columnNames);
      if (columnValue !== null) {
        return columnValue;
      }
    }
    return null;
  }

  private getDatatableColumnValue(datatable: any, columnNames: string[]): string | number | null {
    const row = datatable?.data?.[0]?.row;
    const columnHeaders = datatable?.columnHeaders || [];
    if (!row || columnHeaders.length === 0) {
      return null;
    }

    const normalizedColumnNames = columnNames.map((columnName: string) => this.normalizeColumnName(columnName));
    const columnIndex = columnHeaders.findIndex((columnHeader: any) =>
      normalizedColumnNames.includes(this.normalizeColumnName(columnHeader?.columnName))
    );

    if (columnIndex === -1) {
      return null;
    }

    const value = row[columnIndex];
    return value === undefined || value === null || value === '' ? null : value;
  }

  private getClientIdForSearchResult(result: SearchData): string {
    return (result.entityType === 'CLIENTIDENTIFIER' ? result.parentId : result.entityId)?.toString();
  }

  private normalizeColumnName(columnName: string): string {
    return (columnName || '').replace(/[_\s-]/g, '').toLowerCase();
  }

  /**
   * Returns link to entity view page.
   * @param {any} entity Entity
   */
  navigate(entity: SearchData) {
    switch (entity.entityType) {
      case 'CLIENT':
        this.router.navigate([
          'clients',
          entity.entityId,
          'general'
        ]);
        break;
      case 'CLIENTIDENTIFIER':
        this.router.navigate([
          'clients',
          entity.parentId,
          'general'
        ]);
        break;
      case 'CENTER':
        this.router.navigate([
          'centers',
          entity.entityId
        ]);
        break;
      case 'GROUP':
        this.router.navigate([
          'groups',
          entity.entityId
        ]);
        break;
      case 'SHARE':
        this.router.navigate([
          'clients',
          entity.parentId,
          'shares-accounts',
          entity.entityId
        ]);
        break;
      case 'SAVING':
        if (entity.subEntityType === 'depositAccountType.recurringDeposit') {
          this.router.navigate([
            'clients',
            entity.parentId,
            'recurring-deposits-accounts',
            entity.entityId,
            'transactions'
          ]);
        } else if (entity.subEntityType === 'depositAccountType.fixedDeposit') {
          this.router.navigate([
            'clients',
            entity.parentId,
            'fixed-deposits-accounts',
            entity.entityId,
            'transactions'
          ]);
        } else if (entity.subEntityType === 'depositAccountType.savingsDeposit') {
          this.router.navigate([
            'clients',
            entity.parentId,
            'savings-accounts',
            entity.entityId,
            'transactions'
          ]);
        }
        break;
      case 'LOAN':
        this.router.navigate([
          'clients',
          entity.parentId,
          'loans-accounts',
          entity.entityId,
          'general'
        ]);
        break;
    }
  }
}
