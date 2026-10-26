/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { JournalEntryLine, SearchData, SearchResultsBundle } from '../search.model';
import { AccountNumberComponent } from '../../shared/account-number/account-number.component';
import { ExternalIdentifierComponent } from '../../shared/external-identifier/external-identifier.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Scope segments shown above the results. */
type DomainKey = 'all' | 'people' | 'accounts' | 'transactions' | 'accounting';

/** Result sections, in display order. */
type GroupKey =
  | 'clients'
  | 'groupsCenters'
  | 'loans'
  | 'savingsDeposits'
  | 'shares'
  | 'loanTransactions'
  | 'savingsTransactions'
  | 'accountingEntries';

/** Contextual refine filters within a domain. */
type SubKey =
  | 'any'
  | 'clients'
  | 'groupsCenters'
  | 'loans'
  | 'savings'
  | 'fixedDeposits'
  | 'recurringDeposits'
  | 'shares'
  | 'loanTransactions'
  | 'savingsTransactions';

type StatusTone = 'active' | 'pending' | 'closed';

interface GroupDef {
  key: GroupKey;
  domain: DomainKey;
  labelKey: string;
  hue: string;
}

interface SubFilterDef {
  key: SubKey;
  labelKey: string;
  hue?: string;
}

/** Display-ready row derived from a search result or a journal entry. */
interface SearchRow {
  group: GroupKey;
  sub: SubKey | null;
  hue: string;
  name: string;
  detail: string;
  accountNo: string;
  externalId: string;
  linkedToLabelKey: string;
  linkedToName: string;
  statusLabel: string;
  statusTone: StatusTone;
  entity?: SearchData;
  journalTransactionId?: string;
}

interface VisibleGroup {
  def: GroupDef;
  rows: SearchRow[];
}

const GROUP_DEFS: GroupDef[] = [
  { key: 'clients', domain: 'people', labelKey: 'labels.text.Clients', hue: 'client' },
  { key: 'groupsCenters', domain: 'people', labelKey: 'labels.text.Groups & Centers', hue: 'group' },
  { key: 'loans', domain: 'accounts', labelKey: 'labels.text.Loans', hue: 'loan' },
  { key: 'savingsDeposits', domain: 'accounts', labelKey: 'labels.text.Savings & Deposits', hue: 'saving' },
  { key: 'shares', domain: 'accounts', labelKey: 'labels.text.Shares', hue: 'share' },
  { key: 'loanTransactions', domain: 'transactions', labelKey: 'labels.text.Loan Transactions', hue: 'loan' },
  { key: 'savingsTransactions', domain: 'transactions', labelKey: 'labels.text.Savings Transactions', hue: 'saving' },
  { key: 'accountingEntries', domain: 'accounting', labelKey: 'labels.text.Accounting Entries', hue: 'journal' }
];

const GROUP_DOMAINS: Record<GroupKey, DomainKey> = GROUP_DEFS.reduce(
  (domains, def) => ({ ...domains, [def.key]: def.domain }),
  {} as Record<GroupKey, DomainKey>
);

const SUB_FILTER_DEFS: Record<DomainKey, SubFilterDef[]> = {
  all: [],
  people: [
    { key: 'any', labelKey: 'labels.text.Any' },
    { key: 'clients', labelKey: 'labels.text.Clients', hue: 'client' },
    { key: 'groupsCenters', labelKey: 'labels.text.Groups & Centers', hue: 'group' }
  ],
  accounts: [
    { key: 'any', labelKey: 'labels.text.Any' },
    { key: 'loans', labelKey: 'labels.text.Loans', hue: 'loan' },
    { key: 'savings', labelKey: 'labels.text.Savings', hue: 'saving' },
    { key: 'fixedDeposits', labelKey: 'labels.text.Fixed Deposits', hue: 'saving' },
    { key: 'recurringDeposits', labelKey: 'labels.text.Recurring Deposits', hue: 'saving' },
    { key: 'shares', labelKey: 'labels.text.Shares', hue: 'share' }
  ],
  transactions: [
    { key: 'any', labelKey: 'labels.text.Any' },
    { key: 'loanTransactions', labelKey: 'labels.text.Loan Transactions', hue: 'loan' },
    { key: 'savingsTransactions', labelKey: 'labels.text.Savings Transactions', hue: 'saving' }
  ],
  accounting: []
};

/** The backend caps every /search response at this many rows. */
const SEARCH_RESULT_LIMIT = 50;

/**
 * Search Page Component
 */
@Component({
  selector: 'mifosx-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    AccountNumberComponent,
    ExternalIdentifierComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchPageComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private translateService = inject(TranslateService);

  /** Scope segments, in display order. */
  readonly domains: { key: DomainKey; labelKey: string }[] = [
    { key: 'all', labelKey: 'labels.text.All' },
    { key: 'people', labelKey: 'labels.text.People' },
    { key: 'accounts', labelKey: 'labels.text.Accounts' },
    { key: 'transactions', labelKey: 'labels.text.Transactions' },
    { key: 'accounting', labelKey: 'labels.text.Accounting' }
  ];

  /** In-page search box, kept in sync with the query param. */
  query = new FormControl<string>('', { nonNullable: true });

  queryText = '';
  selectedDomain: DomainKey = 'all';
  selectedSub: SubKey = 'any';
  domainCounts: Record<DomainKey, number> = { all: 0, people: 0, accounts: 0, transactions: 0, accounting: 0 };
  visibleGroups: VisibleGroup[] = [];
  totalCount = 0;
  shownCount = 0;
  hasResults = false;
  limitReached = false;

  private rows: SearchRow[] = [];

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { searchResults: SearchResultsBundle }) => {
        this.queryText = this.route.snapshot.queryParams['query'] || '';
        this.query.patchValue(this.queryText);
        this.rows = this.buildRows(data.searchResults);
        this.totalCount = this.rows.length;
        this.hasResults = this.rows.length > 0;
        this.limitReached = (data.searchResults?.entities || []).length >= SEARCH_RESULT_LIMIT;
        this.domainCounts = this.countByDomain(this.rows);
        this.selectedDomain = 'all';
        this.selectedSub = 'any';
        this.refresh();
        this.cdr.markForCheck();
      });
  }

  get subFilters(): SubFilterDef[] {
    return SUB_FILTER_DEFS[this.selectedDomain];
  }

  /** Re-runs the search with the current query; the route resolver reloads the data. */
  search(): void {
    this.router.navigate(['/search'], { queryParams: { query: this.query.value } });
  }

  selectDomain(domain: DomainKey): void {
    this.selectedDomain = domain;
    this.selectedSub = 'any';
    this.refresh();
  }

  selectSub(sub: SubKey): void {
    this.selectedSub = sub;
    this.refresh();
  }

  /** Opens the details page behind a result row. */
  open(row: SearchRow): void {
    if (row.journalTransactionId) {
      this.router.navigate([
        '/accounting',
        'journal-entries',
        'transactions',
        'view',
        row.journalTransactionId
      ]);
      return;
    }
    if (row.entity) {
      this.navigate(row.entity);
    }
  }

  /** Keyboard variant of open(): space scrolls the page by default, so prevent it first. */
  openFromKeyboard(event: Event, row: SearchRow): void {
    event.preventDefault();
    this.open(row);
  }

  /**
   * Returns link to entity view page. Loans and savings resolve their parent
   * route from parentType, since the backend reports both client- and
   * group-owned accounts through the same entity types.
   * @param {SearchData} entity Entity
   */
  navigate(entity: SearchData): void {
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
        // Fixed and recurring deposit routes only exist under clients.
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
            this.parentRoute(entity),
            entity.parentId,
            'savings-accounts',
            entity.entityId,
            'transactions'
          ]);
        }
        break;
      case 'LOAN':
        this.router.navigate([
          this.parentRoute(entity),
          entity.parentId,
          'loans-accounts',
          entity.entityId,
          'general'
        ]);
        break;
    }
  }

  private refresh(): void {
    this.visibleGroups = GROUP_DEFS.map((def) => ({
      def,
      rows: this.rows.filter((row) => row.group === def.key && this.matchesScope(row))
    })).filter((group) => group.rows.length > 0);
    this.shownCount = this.visibleGroups.reduce((count, group) => count + group.rows.length, 0);
    this.cdr.markForCheck();
  }

  private matchesScope(row: SearchRow): boolean {
    return (
      (this.selectedDomain === 'all' || GROUP_DOMAINS[row.group] === this.selectedDomain) &&
      (this.selectedSub === 'any' || row.sub === this.selectedSub)
    );
  }

  private countByDomain(rows: SearchRow[]): Record<DomainKey, number> {
    const counts: Record<DomainKey, number> = {
      all: rows.length,
      people: 0,
      accounts: 0,
      transactions: 0,
      accounting: 0
    };
    rows.forEach((row) => {
      counts[GROUP_DOMAINS[row.group]] += 1;
    });
    return counts;
  }

  private buildRows(bundle: SearchResultsBundle): SearchRow[] {
    const entityRows = (bundle?.entities || [])
      .map((entity) => this.buildEntityRow(entity))
      .filter((row): row is SearchRow => row !== null);
    return entityRows.concat(this.buildJournalRows(bundle?.journalEntries || []));
  }

  private buildEntityRow(entity: SearchData): SearchRow | null {
    switch (entity.entityType) {
      case 'CLIENT':
        return this.entityRow(entity, 'clients', 'clients', 'client', 'labels.inputs.Office');
      case 'CLIENTIDENTIFIER':
        return this.entityRow(entity, 'clients', 'clients', 'id', 'labels.inputs.Client');
      case 'GROUP':
        return this.entityRow(entity, 'groupsCenters', 'groupsCenters', 'group', 'labels.inputs.Office');
      case 'CENTER':
        return this.entityRow(entity, 'groupsCenters', 'groupsCenters', 'center', 'labels.inputs.Office');
      case 'LOAN':
        return this.entityRow(entity, 'loans', 'loans', 'loan', this.parentLabelKey(entity));
      case 'SAVING':
        return this.entityRow(
          entity,
          'savingsDeposits',
          this.savingSubKey(entity),
          'saving',
          this.parentLabelKey(entity)
        );
      case 'SHARE':
        return this.entityRow(entity, 'shares', 'shares', 'share', 'labels.inputs.Client');
      case 'LOAN_TRANSACTION':
        return this.transactionRow(entity, 'loanTransactions', 'loanTransactions', 'loan');
      case 'SAVINGS_TRANSACTION':
        return this.transactionRow(entity, 'savingsTransactions', 'savingsTransactions', 'saving');
      default:
        return null;
    }
  }

  private entityRow(
    entity: SearchData,
    group: GroupKey,
    sub: SubKey,
    hue: string,
    linkedToLabelKey: string
  ): SearchRow {
    return {
      group,
      sub,
      hue,
      name: this.emptyIfMissing(entity.entityName),
      detail: '',
      accountNo: this.emptyIfMissing(entity.entityAccountNo),
      externalId: this.emptyIfMissing(entity.entityExternalId),
      linkedToLabelKey,
      linkedToName: this.emptyIfMissing(entity.parentName),
      statusLabel: this.translateStatus(entity.entityStatus?.value),
      statusTone: this.statusTone(entity.entityStatus?.code),
      entity
    };
  }

  private transactionRow(entity: SearchData, group: GroupKey, sub: SubKey, hue: string): SearchRow {
    return {
      group,
      sub,
      hue,
      name: this.transactionName(entity),
      detail: this.emptyIfMissing(entity.entityName),
      accountNo: this.emptyIfMissing(entity.accountNo || entity.entityAccountNo),
      externalId: this.emptyIfMissing(
        entity.transactionExternalId || entity.transactionRefNo || entity.entityExternalId
      ),
      linkedToLabelKey: this.parentLabelKey(entity),
      linkedToName: this.emptyIfMissing(entity.parentName),
      statusLabel: this.translateStatus(entity.entityStatus?.value),
      statusTone: this.statusTone(entity.entityStatus?.code),
      entity
    };
  }

  /** Journal entry lines share a transaction id; one row is shown per transaction. */
  private buildJournalRows(lines: JournalEntryLine[]): SearchRow[] {
    const byTransaction = new Map<string, JournalEntryLine>();
    lines.forEach((line) => {
      const existing = byTransaction.get(line.transactionId);
      if (!existing || (line.reversed && !existing.reversed)) {
        byTransaction.set(line.transactionId, line);
      }
    });
    return Array.from(byTransaction.values()).map((line): SearchRow => ({
      group: 'accountingEntries',
      sub: null,
      hue: 'journal',
      name: `${this.translateService.instant('labels.text.Journal Entry')} ${line.transactionId}`,
      detail: '',
      accountNo: this.emptyIfMissing(line.transactionId),
      externalId: '',
      linkedToLabelKey: 'labels.inputs.Office',
      linkedToName: this.emptyIfMissing(line.officeName),
      statusLabel: this.translateService.instant(line.reversed ? 'labels.text.Reversed' : 'labels.text.Posted'),
      statusTone: line.reversed ? 'closed' : 'active',
      journalTransactionId: line.transactionId
    }));
  }

  private transactionName(entity: SearchData): string {
    const transactionType = this.formatTransactionType(entity.transactionType);
    const transactionId = this.emptyIfMissing(entity.transactionId);

    if (transactionType && transactionId) {
      return `${transactionType} #${transactionId}`;
    }

    return transactionType || transactionId;
  }

  private savingSubKey(entity: SearchData): SubKey {
    if (entity.subEntityType === 'depositAccountType.fixedDeposit') {
      return 'fixedDeposits';
    }
    if (entity.subEntityType === 'depositAccountType.recurringDeposit') {
      return 'recurringDeposits';
    }
    return 'savings';
  }

  /** Backend status values (e.g. "Active") have translations under labels.status. */
  private translateStatus(statusValue: string | null | undefined): string {
    if (!statusValue) {
      return '';
    }
    const key = `labels.status.${statusValue}`;
    const translated = this.translateService.instant(key);
    return translated === key ? statusValue : translated;
  }

  private statusTone(statusCode: string | null | undefined): StatusTone {
    const code = (statusCode || '').toLowerCase();
    if (code.includes('active')) {
      return 'active';
    }
    if (code.includes('closed') || code.includes('rejected') || code.includes('withdrawn')) {
      return 'closed';
    }
    return 'pending';
  }

  private parentLabelKey(entity: SearchData): string {
    return this.isGroupParent(entity) ? 'labels.inputs.Group' : 'labels.inputs.Client';
  }

  private parentRoute(entity: SearchData): string {
    return this.isGroupParent(entity) ? 'groups' : 'clients';
  }

  private isGroupParent(entity: SearchData): boolean {
    return entity.parentType?.toLowerCase() === 'group';
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

    const commands = [
      this.parentRoute(entity),
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
}
