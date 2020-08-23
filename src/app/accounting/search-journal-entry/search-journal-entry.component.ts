/** Angular Imports */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { FormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { merge } from 'rxjs';
import { tap, startWith, map, distinctUntilChanged, debounceTime} from 'rxjs/operators';

/** Custom Services */
import { AccountingService } from '../accounting.service';

/** Custom Data Source */
import { JournalEntriesDataSource } from './journal-entry.datasource';

/**
 * Search journal entry component.
 */
@Component({
  selector: 'mifosx-search-journal-entry',
  templateUrl: './search-journal-entry.component.html',
  styleUrls: ['./search-journal-entry.component.scss']
})
export class SearchJournalEntryComponent implements OnInit, AfterViewInit {

  /** Minimum transaction date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum transaction date allowed. */
  maxDate = new Date();
  /** Office name filter form control.  */
  officeName = new FormControl();
  /** Office data. */
  officeData: any;
  /** Filtered office data for autocomplete. */
  filteredOfficeData: any;
  /** Gl Account filter form control. */
  glAccount = new FormControl();
  /** Gl Account data. */
  glAccountData: any;
  /** Filtered gl account data. */
  filteredGLAccountData: any;
  /** Entry type filter form control. */
  entryTypeFilter = new FormControl('');
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
      value: false  // Bug: unable to implement from server side
    }
  ];
  /** Transaction date from form control. */
  transactionDateFrom = new FormControl(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  /** Transaction date to form control. */
  transactionDateTo = new FormControl(new Date());
  /** Transaction ID form control. */
  transactionId = new FormControl();
  /** Columns to be displayed in journal entries table. */
  displayedColumns: string[] = ['id', 'officeName', 'transactionId', 'transactionDate', 'glAccountType', 'createdByUserName', 'glAccountCode', 'glAccountName', 'debit', 'credit'];
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
      value: this.getDate(new Date(new Date().setMonth(new Date().getMonth() - 1)))
    },
    {
      type: 'toDate',
      value: this.getDate(new Date())
    },
    {
      type: 'dateFormat',
      value: 'yyyy-MM-dd'
    },
    {
      type: 'locale',
      value: 'en'
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
   */
  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute) {
    this.route.data.subscribe((data: {
        offices: any,
        glAccounts: any
      }) => {
        this.officeData = data.offices;
        this.glAccountData = data.glAccounts;
      });
  }

  /**
   * Sets filtered offices and gl accounts for autocomplete and journal entries table.
   */
  ngOnInit() {
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
        map(value => value.id ? value.id : ''),
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'officeId');
        })
      )
      .subscribe();

    this.glAccount.valueChanges
      .pipe(
        map(value => value.id ? value.id : ''),
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
          this.applyFilter(this.getDate(filterValue), 'fromDate');
        })
      )
      .subscribe();

    this.transactionDateTo.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(this.getDate(filterValue), 'toDate');
        })
      )
      .subscribe();

    this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(
        tap(() => this.loadJournalEntriesPage())
      )
      .subscribe();
  }

  /**
   * Loads a page of journal entries.
   */
  loadJournalEntriesPage() {
    if (!this.sort.direction) {
      delete this.sort.active;
    }
    this.dataSource.getJournalEntries(this.filterJournalEntriesBy, this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
  }

  /**
   * Filters data in journal entries table based on passed value and poperty.
   * @param {string} filterValue Value to filter data.
   * @param {string} property Property to filter data by.
   */
  applyFilter(filterValue: string, property: string) {
    this.paginator.pageIndex = 0;
    const findIndex = this.filterJournalEntriesBy.findIndex(filter => filter.type === property);
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
   * Displays gl account name in form control input.
   * @param {any} glAccount Gl Account data.
   * @returns {string} Gl Account name if valid otherwise undefined.
   */
  displayGLAccount(glAccount?: any): string | undefined {
    return glAccount ? glAccount.name + ' (' + glAccount.glCode + ')' : undefined;
  }

  /**
   * Sets filtered offices for autocomplete.
   */
  setFilteredOffices() {
    this.filteredOfficeData = this.officeName.valueChanges
      .pipe(
        startWith(''),
        map((office: any) => typeof office === 'string' ? office : office.name),
        map((officeName: string) => officeName ? this.filterOfficeAutocompleteData(officeName) : this.officeData)
      );
  }

  /**
   * Sets filtered gl accounts for autocomplete.
   */
  setFilteredGlAccounts() {
    this.filteredGLAccountData = this.glAccount.valueChanges
      .pipe(
        startWith(''),
        map((glAccount: any) => typeof glAccount === 'string' ? glAccount : glAccount.name + ' (' + glAccount.glCode + ')'),
        map((glAccount: string) => glAccount ? this.filterGLAccountAutocompleteData(glAccount) : this.glAccountData)
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
    return this.glAccountData.filter((option: any) => (option.name + ' (' + option.glCode + ')').toLowerCase().includes(glAccount.toLowerCase()));
  }

  /**
   * Initializes the data source for journal entries table and loads the first page.
   */
  getJournalEntries() {
    this.dataSource = new JournalEntriesDataSource(this.accountingService);
    this.dataSource.getJournalEntries(this.filterJournalEntriesBy, this.sort.active, this.sort.direction, this.paginator.pageIndex, this.paginator.pageSize);
  }

  /**
   * Gets the date from the passed timestamp.
   *
   * TODO: Update once language and date settings are setup.
   *
   * @param {any} timestamp Timestam from which date is to be extracted.
   */
  private getDate(timestamp: any) {
    let day = timestamp.getDate();
    let month = timestamp.getMonth() + 1;
    const year = timestamp.getFullYear();
    if (day < 10) {
      day = `0${day}`;
    }
    if (month < 10) {
      month = `0${month}`;
    }
    return `${year}-${month}-${day}`;
  }

}
