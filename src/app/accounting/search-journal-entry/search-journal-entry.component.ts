/** Angular Imports */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

/** rxjs Imports */
import { merge } from 'rxjs';
import { tap, startWith, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';

/** Custom Services */
import { AccountingService } from '../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
/** Custom Data Source */
import { JournalEntriesDataSource } from './journal-entry.datasource';
import { Dates } from 'app/core/utils/dates';
import { MatAutocompleteTrigger, MatOption, MatAutocomplete } from '@angular/material/autocomplete';
import { GlAccountSelectorComponent } from '../../shared/accounting/gl-account-selector/gl-account-selector.component';
import { NgFor, NgIf, AsyncPipe } from '@angular/common';
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
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { DatetimeFormatPipe } from '../../pipes/datetime-format.pipe';
import { FormatNumberPipe } from '../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Search journal entry component.
 */
@Component({
  selector: 'mifosx-search-journal-entry',
  templateUrl: './search-journal-entry.component.html',
  styleUrls: ['./search-journal-entry.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAutocompleteTrigger,
    GlAccountSelectorComponent,
    MatAutocomplete,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    AsyncPipe,
    DateFormatPipe,
    DatetimeFormatPipe,
    FormatNumberPipe
  ]
})
export class SearchJournalEntryComponent implements OnInit, AfterViewInit {
  /** Minimum transaction date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum transaction date allowed. */
  maxDate = new Date();
  /** Office name filter form control.  */
  officeName = new UntypedFormControl();
  /** Office data. */
  officeData: any;
  /** Filtered office data for autocomplete. */
  filteredOfficeData: any;
  /** Gl Account filter form control. */
  glAccount = new UntypedFormControl();
  /** Gl Account data. */
  glAccountData: any;
  /** Filtered gl account data. */
  filteredGLAccountData: any;
  /** Entry type filter form control. */
  entryTypeFilter = new UntypedFormControl('');
  /** Entry type filter data. */
  entryTypeFilterData = [
    {
      option: 'All',
      value: ''
    },
    {
      option: 'Manual Entries',
      value: true
    },
    {
      option: 'System Entries',
      value: false // Bug: unable to implement from server side
    }
  ];
  /** Transaction date from form control. */
  transactionDateFrom = new UntypedFormControl(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  /** Transaction date to form control. */
  transactionDateTo = new UntypedFormControl(new Date());
  /** Transaction ID form control. */
  transactionId = new UntypedFormControl();
  /** Submitted on date from form control. */
  submittedOnDateFrom = new UntypedFormControl();
  /** Submitted on date to form control. */
  submittedOnDateTo = new UntypedFormControl();
  /** Columns to be displayed in journal entries table. */
  displayedColumns: string[] = [
    'id',
    'officeName',
    'transactionId',
    'transactionDate',
    'glAccountType',
    'createdByUserName',
    'submittedOnDate',
    'glAccountCode',
    'glAccountName',
    'currency',
    'debit',
    'credit'
  ];
  /** Data source for journal entries table. */
  dataSource: JournalEntriesDataSource;
  /** Journal entries filter. */
  filterJournalEntriesBy = [
    {
      type: 'officeId',
      value: ''
    },
    {
      type: 'glAccountId',
      value: ''
    },
    {
      type: 'manualEntriesOnly',
      value: ''
    },
    {
      type: 'transactionId',
      value: ''
    },
    {
      type: 'fromDate',
      value: this.dateUtils.formatDate(
        new Date(new Date().setMonth(new Date().getMonth() - 1)),
        this.settingsService.dateFormat
      )
    },
    {
      type: 'toDate',
      value: this.dateUtils.formatDate(new Date(), this.settingsService.dateFormat)
    },
    {
      type: 'submittedOnDateFrom',
      value: ''
    },
    {
      type: 'submittedOnDateTo',
      value: ''
    },
    {
      type: 'dateFormat',
      value: this.settingsService.dateFormat
    },
    {
      type: 'locale',
      value: this.settingsService.language.code
    }
  ];

  /** Paginator for journal entries table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for journal entries table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the offices and gl accounts data from `resolve`.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(
    private accountingService: AccountingService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute
  ) {
    this.route.data.subscribe((data: { offices: any; glAccounts: any }) => {
      this.officeData = data.offices;
      this.glAccountData = data.glAccounts;
    });
  }

  /**
   * Sets filtered offices and gl accounts for autocomplete and journal entries table.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setFilteredOffices();
    this.setFilteredGlAccounts();
    this.getJournalEntries();
  }

  /**
   * Subscribes to all search filters:
   * Office Name, GL Account, Transaction ID, Transaction Date From, Transaction Date To,
   * sort change and page change.
   */
  ngAfterViewInit() {
    this.officeName.valueChanges
      .pipe(
        map((value) => (value.id ? value.id : '')),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'officeId');
        })
      )
      .subscribe();

    this.glAccount.valueChanges
      .pipe(
        map((value) => (value ? value : '')),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'glAccountId');
        })
      )
      .subscribe();

    this.transactionId.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'transactionId');
        })
      )
      .subscribe();

    this.transactionDateFrom.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(this.dateUtils.formatDate(filterValue, this.settingsService.dateFormat), 'fromDate');
        })
      )
      .subscribe();

    this.transactionDateTo.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(this.dateUtils.formatDate(filterValue, this.settingsService.dateFormat), 'toDate');
        })
      )
      .subscribe();

    this.submittedOnDateFrom.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(
            this.dateUtils.formatDate(filterValue, this.settingsService.dateFormat),
            'submittedOnDateFrom'
          );
        })
      )
      .subscribe();

    this.submittedOnDateTo.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(
            this.dateUtils.formatDate(filterValue, this.settingsService.dateFormat),
            'submittedOnDateTo'
          );
        })
      )
      .subscribe();

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadJournalEntriesPage()))
      .subscribe();
  }

  /**
   * Loads a page of journal entries.
   */
  loadJournalEntriesPage() {
    if (!this.sort.direction) {
      delete this.sort.active;
    }
    this.dataSource.getJournalEntries(
      this.filterJournalEntriesBy,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  /**
   * Filters data in journal entries table based on passed value and poperty.
   * @param {string} filterValue Value to filter data.
   * @param {string} property Property to filter data by.
   */
  applyFilter(filterValue: string, property: string) {
    this.paginator.pageIndex = 0;
    const findIndex = this.filterJournalEntriesBy.findIndex((filter) => filter.type === property);
    this.filterJournalEntriesBy[findIndex].value = filterValue;
    this.loadJournalEntriesPage();
  }

  /**
   * Displays office name in form control input.
   * @param {any} office Office data.
   * @returns {string} Office name if valid otherwise undefined.
   */
  displayOfficeName(office?: any): string | undefined {
    return office ? office.name : undefined;
  }

  /**
   * Sets filtered offices for autocomplete.
   */
  setFilteredOffices() {
    this.filteredOfficeData = this.officeName.valueChanges.pipe(
      startWith(''),
      map((office: any) => (typeof office === 'string' ? office : office.name)),
      map((officeName: string) => (officeName ? this.filterOfficeAutocompleteData(officeName) : this.officeData))
    );
  }

  /**
   * Sets filtered gl accounts for autocomplete.
   */
  setFilteredGlAccounts() {
    this.filteredGLAccountData = this.glAccount.valueChanges.pipe(
      startWith(''),
      map((glAccount: any) =>
        typeof glAccount === 'string' ? glAccount : glAccount.name + ' (' + glAccount.glCode + ')'
      ),
      map((glAccount: string) => (glAccount ? this.filterGLAccountAutocompleteData(glAccount) : this.glAccountData))
    );
  }

  /**
   * Filters offices.
   * @param {string} officeName Office name to filter office by.
   * @returns {any} Filtered offices.
   */
  private filterOfficeAutocompleteData(officeName: string): any {
    return this.officeData.filter((office: any) => office.name.toLowerCase().includes(officeName.toLowerCase()));
  }

  /**
   * Filters gl accounts.
   * @param {string} glAccount Gl Account name to filter gl account by.
   * @returns {any} Filtered gl accounts.
   */
  private filterGLAccountAutocompleteData(glAccount: string): any {
    return this.glAccountData.filter((option: any) =>
      (option.name + ' (' + option.glCode + ')').toLowerCase().includes(glAccount.toLowerCase())
    );
  }

  /**
   * Initializes the data source for journal entries table and loads the first page.
   */
  getJournalEntries() {
    this.dataSource = new JournalEntriesDataSource(this.accountingService);
    this.dataSource.getJournalEntries(
      this.filterJournalEntriesBy,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }
}
