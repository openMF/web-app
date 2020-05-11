/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** rxjs Imports */
import { startWith, map } from 'rxjs/operators';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Closing entries component.
 */
@Component({
  selector: 'mifosx-closing-entries',
  templateUrl: './closing-entries.component.html',
  styleUrls: ['./closing-entries.component.scss']
})
export class ClosingEntriesComponent implements OnInit, AfterViewInit {

  /** Columns to be displayed in closing entries table. */
  displayedColumns: string[] = ['officeName', 'closingDate', 'comments', 'createdByUsername'];
  /** Data source for closing entries table. */
  dataSource: MatTableDataSource<any>;
  /** Office name filter form control. */
  officeName = new FormControl();
  /** Office data. */
  officeData: any;
  /** Filtered office data for autocomplete. */
  filteredOfficeData: any;
  /** GL Account closure data. */
  glAccountClosureData: any;

  /** Paginator for closing entries table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for closing entries table. */
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('buttonCreateClosure') buttonCreateClosure: ElementRef<any>;
  @ViewChild('templateButtonCreateClosure') templateButtonCreateClosure: TemplateRef<any>;
  @ViewChild('closuresTable') closuresTable: ElementRef<any>;
  @ViewChild('templateClosuresTable') templateClosuresTable: TemplateRef<any>;

  /**
   * Retrieves the offices and gl account closures data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe((data: {
      offices: any,
      glAccountClosures: any
    }) => {
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
    this.filteredOfficeData = this.officeName.valueChanges
    .pipe(
      startWith(''),
      map((office: any) => typeof office === 'string' ? office : office.name),
      map((officeName: string) => officeName ? this.filterOfficeAutocompleteData(officeName) : this.officeData)
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

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

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

  nextStep() {
    this.configurationWizardService.showClosingEntriesPage = false;
    this.configurationWizardService.showClosingEntriesList = false;
    this.configurationWizardService.showCreateJournalEntries = true;
    this.router.navigate(['/accounting']);
  }

  previousStep() {
    this.configurationWizardService.showClosingEntriesPage = false;
    this.configurationWizardService.showClosingEntriesList = false;
    this.configurationWizardService.showClosingEntries = true;
    this.router.navigate(['/accounting']);
  }
}
