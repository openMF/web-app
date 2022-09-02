/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/**
 * Fixed Deposit Products component.
 */
@Component({
  selector: 'mifosx-fixed-deposit-products',
  templateUrl: './fixed-deposit-products.component.html',
  styleUrls: ['./fixed-deposit-products.component.scss']
})
export class FixedDepositProductsComponent implements OnInit, AfterViewInit {

  /** Fixed deposit products data. */
  fixedDepositProductData: any;
  /** Columns to be displayed in fixed deposit products table. */
  displayedColumns: string[] = ['name', 'shortName'];
  /** Data source for fixed deposit products table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for fixed deposit products table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for fixed deposit products table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create fixed product button */
  @ViewChild('buttonCreateFixedProduct') buttonCreateFixedProduct: ElementRef<any>;
  /* Template for popover on create fixed product button */
  @ViewChild('templateButtonCreateFixedProduct') templateButtonCreateFixedProduct: TemplateRef<any>;
  /* Reference of fixed deposit products table */
  @ViewChild('fixedProductsTable') fixedProductsTable: ElementRef<any>;
  /* Template for popover on fixed deposit products table */
  @ViewChild('templateFixedProductsTable') templateFixedProductsTable: TemplateRef<any>;

  /**
   * Retrieves the fixed deposit products data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { fixedDepositProducts: any }) => {
      this.fixedDepositProductData = data.fixedDepositProducts;
    });
  }

  /**
   * Filters data in fixed deposit products table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the fixed deposit products table.
   */
  ngOnInit() {
    this.setFixedDepositProducts();
  }

  /**
   * Initializes the data source, paginator and sorter for fixed deposit products table.
   */
  setFixedDepositProducts() {
    this.dataSource = new MatTableDataSource(this.fixedDepositProductData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showFixedDepositProductsPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateFixedProduct, this.buttonCreateFixedProduct.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showFixedDepositProductsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateFixedProductsTable, this.fixedProductsTable.nativeElement, 'top', true);
      });
    }
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
   * Next Step (Recurring Deposits Products-Products Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showFixedDepositProductsPage = false;
    this.configurationWizardService.showFixedDepositProductsList = false;
    this.configurationWizardService.showRecurringDepositProducts = true;
    this.router.navigate(['/products']);
  }

  /**
   * Previous Step (Fixed Deposits Products-Products Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showFixedDepositProductsPage = false;
    this.configurationWizardService.showFixedDepositProductsList = false;
    this.configurationWizardService.showFixedDepositProducts = true;
    this.router.navigate(['/products']);
  }

}
