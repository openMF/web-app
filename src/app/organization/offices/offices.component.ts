/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
import { ActivatedRoute, Router, } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Offices component.
 */
@Component({
  selector: 'mifosx-offices',
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss']
})
export class OfficesComponent implements OnInit, AfterViewInit {

  /** Offices data. */
  officesData: any;
  /** Columns to be displayed in offices table. */
  displayedColumns: string[] = ['name', 'externalId', 'parentName', 'openingDate'];
  /** Data source for offices table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for offices table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for offices table. */
  @ViewChild(MatSort) sort: MatSort;

  /* Reference of tree view button */
  @ViewChild('buttonTreeView') buttonTreeView: ElementRef<any>;
  /* Template for popover on tree view button */
  @ViewChild('templateButtonTreeView') templateButtonTreeView: TemplateRef<any>;
  /* Reference of offices table */
  @ViewChild('tableOffices') tableOffices: ElementRef<any>;
  /* Template for popover on offices table */
  @ViewChild('templateTableOffices') templateTableOffices: TemplateRef<any>;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { offices: any }) => {
      this.officesData = data.offices;
    });
  }

  /**
   * Filters data in offices table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the offices table.
   */
  ngOnInit() {
    this.setOffices();
  }

  /**
   * Initializes the data source, paginator and sorter for offices table.
   */
  setOffices() {
    this.dataSource = new MatTableDataSource(this.officesData);
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
    if (this.configurationWizardService.showOfficeList === true) {
      setTimeout(() => {
          this.showPopover(this.templateButtonTreeView, this.buttonTreeView.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showOfficeTable === true) {
      setTimeout(() => {
          this.showPopover(this.templateTableOffices, this.tableOffices.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Create Office Form) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showOfficeList = false;
    this.configurationWizardService.showOfficeTable = false;
    this.configurationWizardService.showOfficeForm = true;
    this.router.navigate(['/organization/offices/create']);
  }

  /**
   * Previous Step ( Manage Offices Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showOfficeList = false;
    this.configurationWizardService.showOfficeTable = false;
    this.configurationWizardService.showCreateOffice = true;
    this.router.navigate(['/organization']);
  }

}
