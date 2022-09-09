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
 * Currencies component.
 */
@Component({
  selector: 'mifosx-currencies',
  templateUrl: './currencies.component.html',
  styleUrls: ['./currencies.component.scss']
})
export class CurrenciesComponent implements OnInit, AfterViewInit  {

  /** Currencies data. */
  currenciesData: any;
  /** Columns to be displayed in currencies table. */
  displayedColumns: string[] = ['name', 'code'];
  /** Data source for currencies table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for currencies table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for currencies table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of add/edit button */
  @ViewChild('buttonAddEdit') buttonAddEdit: ElementRef<any>;
  /* Template for popover on add/edit button */
  @ViewChild('templateButtonAddEdit') templateButtonAddEdit: TemplateRef<any>;
  /* Reference of currenies table */
  @ViewChild('tableCurrencies') tableCurrencies: ElementRef<any>;
  /* Template for currencies table */
  @ViewChild('templateTableCurrencies') templateTableCurrencies: TemplateRef<any>;

  /**
   * Retrieves the currencies data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { currencies: any }) => {
      this.currenciesData = data.currencies.selectedCurrencyOptions;
    });
  }

  /**
   * Filters data in currencies table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the currencies table.
   */
  ngOnInit() {
    this.setCurrencies();
  }

  /**
   * Initializes the data source, paginator and sorter for currencies table.
   */
  setCurrencies() {
    this.dataSource = new MatTableDataSource(this.currenciesData);
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
    if (this.configurationWizardService.showCurrencyPage === true) {
      setTimeout(() => {
          this.showPopover(this.templateButtonAddEdit, this.buttonAddEdit.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showCurrencyList === true) {
      setTimeout(() => {
          this.showPopover(this.templateTableCurrencies, this.tableCurrencies.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Add currency page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showCurrencyPage = false;
    this.configurationWizardService.showCurrencyList = false;
    this.configurationWizardService.showCurrencyForm = true;
    this.router.navigate(['/organization/currencies/manage']);
  }

  /**
   * Previous Step (Add/edit Currency) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showCurrencyPage = false;
    this.configurationWizardService.showCurrencyList = false;
    this.configurationWizardService.showAddEditCurrency = true;
    this.router.navigate(['/organization']);
  }

}
