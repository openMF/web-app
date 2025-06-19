/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
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
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** rxjs Imports */
import { startWith, map } from 'rxjs/operators';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { NgFor, AsyncPipe } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Closing entries component.
 */
@Component({
  selector: 'mifosx-closing-entries',
  templateUrl: './closing-entries.component.html',
  styleUrls: ['./closing-entries.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatAutocompleteTrigger,
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
    AsyncPipe
  ]
})
export class ClosingEntriesComponent implements OnInit, AfterViewInit {
  /** Columns to be displayed in closing entries table. */
  displayedColumns: string[] = [
    'officeName',
    'closingDate',
    'comments',
    'createdByUsername'
  ];
  /** Data source for closing entries table. */
  dataSource: MatTableDataSource<any>;
  /** Office name filter form control. */
  officeName = new UntypedFormControl();
  /** Office data. */
  officeData: any;
  /** Filtered office data for autocomplete. */
  filteredOfficeData: any;
  /** GL Account closure data. */
  glAccountClosureData: any;

  /** Paginator for closing entries table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for closing entries table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create closure button */
  @ViewChild('buttonCreateClosure') buttonCreateClosure: ElementRef<any>;
  /* Template for popover on create closure button */
  @ViewChild('templateButtonCreateClosure') templateButtonCreateClosure: TemplateRef<any>;
  /* Reference of closures table */
  @ViewChild('closuresTable') closuresTable: ElementRef<any>;
  /* Template for popover on closures table */
  @ViewChild('templateClosuresTable') templateClosuresTable: TemplateRef<any>;

  /**
   * Retrieves the offices and gl account closures data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService
  ) {
    this.route.data.subscribe((data: { offices: any; glAccountClosures: any }) => {
      this.officeData = data.offices;
      this.glAccountClosureData = data.glAccountClosures;
    });
  }

  /**
   * Sets the filter and closing entries table.
   */
  ngOnInit() {
    this.applyFilter();
    this.setFilteredOffices();
    this.setAccountingClosures();
  }

  /**
   * Filters data in closing entries table based on office name.
   */
  applyFilter() {
    this.officeName.valueChanges.subscribe((filterValue: string) => {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    });
  }

  /**
   * Initializes the data source, paginator and sorter for closing entries table.
   */
  setAccountingClosures() {
    this.dataSource = new MatTableDataSource(this.glAccountClosureData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
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
   * Filters offices.
   * @param {string} officeName Office name to filter office by.
   * @returns {any} Filtered offices.
   */
  private filterOfficeAutocompleteData(officeName: string): any {
    return this.officeData.filter((office: any) => office.name.toLowerCase().includes(officeName.toLowerCase()));
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showClosingEntriesPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateClosure, this.buttonCreateClosure.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showClosingEntriesList === true) {
      setTimeout(() => {
        this.showPopover(this.templateClosuresTable, this.closuresTable.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Create journal Entry Accounting Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showClosingEntriesPage = false;
    this.configurationWizardService.showClosingEntriesList = false;
    this.configurationWizardService.showCreateJournalEntries = true;
    this.router.navigate(['/accounting']);
  }

  /**
   * Previous Step (Closing Entries Accounting Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showClosingEntriesPage = false;
    this.configurationWizardService.showClosingEntriesList = false;
    this.configurationWizardService.showClosingEntries = true;
    this.router.navigate(['/accounting']);
  }
}
