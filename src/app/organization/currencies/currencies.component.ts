/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';
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
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for currencies table. */
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('buttonAddEdit') buttonAddEdit: ElementRef<any>;
  @ViewChild('templateButtonAddEdit') templateButtonAddEdit: TemplateRef<any>;
  @ViewChild('tableCurrencies') tableCurrencies: ElementRef<any>;
  @ViewChild('templateTableCurrencies') templateTableCurrencies: TemplateRef<any>;

  /**
   * Retrieves the currencies data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
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

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

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

  nextStep() {
    this.configurationWizardService.showCurrencyPage = false;
    this.configurationWizardService.showCurrencyList = false;
    this.configurationWizardService.showCurrencyForm = true;
    this.router.navigate(['/organization/currencies/manage']);
  }

  previousStep() {
    this.configurationWizardService.showCurrencyPage = false;
    this.configurationWizardService.showCurrencyList = false;
    this.configurationWizardService.showAddEditCurrency = true;
    this.router.navigate(['/organization']);
  }

}
