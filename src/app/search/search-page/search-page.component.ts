/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewChild, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { AccountNumberComponent } from '../../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { MatIconButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { TranslateService } from '@ngx-translate/core';

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
    AccountNumberComponent,
    ExternalIdentifierComponent,
    MatIconButton,
    MatTooltip,
    FaIconComponent,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);

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
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { searchResults: any }) => {
      this.dataSource = new MatTableDataSource(data.searchResults);
      this.dataSource.paginator = this.paginator;
      this.hasResults = data.searchResults.length > 0;
      this.overload = data.searchResults.length > 200 ? true : false;
      if (this.overload) {
        this.dataSource = new MatTableDataSource(data.searchResults.slice(0, 200));
      }
      this.cdr.markForCheck();
    });
  }

  /**
   * Returns link to entity view page.
   * @param {any} entity Entity
   */
  navigate(entity: SearchData) {
    if (this.isLoanTransaction(entity)) {
      this.navigateToTransaction(entity, 'loans-accounts');
      return;
    }

    if (this.isSavingsTransaction(entity)) {
      this.navigateToTransaction(entity, 'savings-accounts', 'general');
      return;
    }

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

  getEntityName(entity: SearchData): string {
    if (!this.isTransaction(entity)) {
      return this.emptyIfMissing(entity.entityName);
    }

    const transactionType = this.formatTransactionType(entity.transactionType);
    const transactionId = this.emptyIfMissing(entity.transactionId);

    if (transactionType && transactionId) {
      return `${transactionType} #${transactionId}`;
    }

    return transactionType || transactionId;
  }

  getAccountNo(entity: SearchData): string {
    return this.emptyIfMissing(
      this.isTransaction(entity) ? entity.accountNo || entity.entityAccountNo : entity.entityAccountNo
    );
  }

  getExternalId(entity: SearchData): string {
    const externalId = this.isTransaction(entity)
      ? entity.transactionExternalId || entity.transactionRefNo || entity.entityExternalId
      : entity.entityExternalId;

    return this.emptyIfMissing(externalId);
  }

  getParentType(entity: SearchData): string {
    const officeParentEntityTypes = [
      'CLIENT',
      'GROUP',
      'CENTER'
    ];

    if (officeParentEntityTypes.includes(entity.entityType)) {
      return this.translateService.instant('labels.inputs.Office');
    }

    return this.translateService.instant(this.getParentTypeLabel(entity.parentType));
  }

  private isTransaction(entity: SearchData): boolean {
    return this.isLoanTransaction(entity) || this.isSavingsTransaction(entity);
  }

  private isLoanTransaction(entity: SearchData): boolean {
    return entity.entityType === 'LOAN_TRANSACTION';
  }

  private isSavingsTransaction(entity: SearchData): boolean {
    return entity.entityType === 'SAVINGS_TRANSACTION';
  }

  private navigateToTransaction(entity: SearchData, accountRoute: string, tab?: string): void {
    if (!entity.parentId || !entity.accountId || !entity.transactionId) {
      return;
    }

    const parentRoute = entity.parentType === 'group' ? 'groups' : 'clients';
    const commands = [
      parentRoute,
      entity.parentId,
      accountRoute,
      entity.accountId,
      'transactions',
      entity.transactionId
    ];

    if (tab) {
      commands.push(tab);
    }

    this.router.navigate(commands);
  }

  private emptyIfMissing(value: string | number | null | undefined): string {
    return value == null ? '' : `${value}`;
  }

  private formatTransactionType(transactionType: string | null | undefined): string {
    if (!transactionType) {
      return '';
    }

    return transactionType.charAt(0).toUpperCase() + transactionType.slice(1);
  }

  private getParentTypeLabel(parentType: string | null | undefined): string {
    if (parentType?.toLowerCase() === 'group') {
      return 'labels.inputs.Group';
    }

    return 'labels.inputs.Client';
  }
}
