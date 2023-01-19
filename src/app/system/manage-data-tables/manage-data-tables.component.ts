/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Manage Data Tables component.
 */
@Component({
  selector: 'mifosx-manage-data-tables',
  templateUrl: './manage-data-tables.component.html',
  styleUrls: ['./manage-data-tables.component.scss']
})
export class ManageDataTablesComponent implements OnInit, AfterViewInit {

  /** Data table data. */
  dataTableData: any;
  /** Columns to be displayed in manage data tables table. */
  displayedColumns: string[] = ['registeredTableName', 'applicationTableName', 'entitySubType'];
  /** Data source for manage data tables table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for manage data tables table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for manage data tables table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create datatables button */
  @ViewChild('createDatatableRef') createDatatableRef: ElementRef<any>;
  /* Template for popover on create datatables button */
  @ViewChild('templateCreateDatatableRef') templateCreateDatatableRef: TemplateRef<any>;
  /* Reference of list of datatables */
  @ViewChild('datatablesList') datatablesList: ElementRef<any>;
  /* Template for popover on list of datatables */
  @ViewChild('templateDatatablesList') templateDatatablesList: TemplateRef<any>;

  /**
   * Retrieves the data tables data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { dataTables: any }) => {
      this.dataTableData = data.dataTables;
    });
  }

  /**
   * Filters data in manage data tables table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the manage data tables table.
   */
  ngOnInit() {
    this.setDataTables();
  }

  /**
   * Initializes the data source, paginator and sorter for manage data tables table.
   */
  setDataTables() {
    this.dataSource = new MatTableDataSource(this.dataTableData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showDatatablesPage === true) {
      setTimeout(() => {
          this.showPopover(this.templateCreateDatatableRef, this.createDatatableRef.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showDatatablesList === true) {
      setTimeout(() => {
          this.showPopover(this.templateDatatablesList, this.datatablesList.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Create data tables Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showDatatablesPage = false;
    this.configurationWizardService.showDatatablesList = false;
    this.configurationWizardService.showDatatablesForm = true;
    this.router.navigate(['/system/data-tables/create']);
  }

  /**
   * Previous Step (Manage Datables system Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showDatatablesPage = false;
    this.configurationWizardService.showDatatablesList = false;
    this.configurationWizardService.showDatatables = true;
    this.router.navigate(['/system']);
  }
}
