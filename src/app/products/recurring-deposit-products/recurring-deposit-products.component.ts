/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { NextStepDialogComponent } from '../../configuration-wizard/next-step-dialog/next-step-dialog.component';

/**
 * Recurring Deposit Products component.
 */
@Component({
  selector: 'mifosx-recurring-deposit-products',
  templateUrl: './recurring-deposit-products.component.html',
  styleUrls: ['./recurring-deposit-products.component.scss']
})
export class RecurringDepositProductsComponent implements OnInit, AfterViewInit {

  /** Data table data. */
  recurringDepositProductData: any;
  /** Columns to be displayed in recurring deposit products table. */
  displayedColumns: string[] = ['name', 'shortName'];
  /** Data source for recurring deposit products table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for recurring deposit products table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for recurring deposit products table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create recurring deposit product button */
  @ViewChild('buttonCreateRecurringProduct') buttonCreateRecurringProduct: ElementRef<any>;
  /* Template for popover on create recurring deposit product button */
  @ViewChild('templateButtonCreateRecurringProduct') templateButtonCreateRecurringProduct: TemplateRef<any>;
  /* Reference of recurring deposit products table */
  @ViewChild('recurringProductsTable') recurringProductsTable: ElementRef<any>;
  /* Template for popover on recurring deposit products table */
  @ViewChild('templateRecurringProductsTable') templateRecurringProductsTable: TemplateRef<any>;

  /**
   * Retrieves the recurring deposit products data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private dialog: MatDialog,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { recurringDepositProducts: any }) => {
      this.recurringDepositProductData = data.recurringDepositProducts;
    });
  }

  /**
   * Filters data in recurring deposit products table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the recurring deposit products table.
   */
  ngOnInit() {
    this.setRecurringDepositProducts();
  }

  /**
   * Initializes the data source, paginator and sorter for recurring deposit products table.
   */
  setRecurringDepositProducts() {
    this.dataSource = new MatTableDataSource(this.recurringDepositProductData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showRecurringDepositProductsPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateRecurringProduct, this.buttonCreateRecurringProduct.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showRecurringDepositProductsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateRecurringProductsTable, this.recurringProductsTable.nativeElement, 'top', true);
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
   * Opens Dialog for next step (Setup Funds and Manage Reports) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showRecurringDepositProductsPage = false;
    this.configurationWizardService.showRecurringDepositProductsList = false;
    this.openNextStepDialog();
  }

  /**
   * Previous Step (Recurring Deposit Products-Products Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showRecurringDepositProductsPage = false;
    this.configurationWizardService.showRecurringDepositProductsList = false;
    this.configurationWizardService.showRecurringDepositProducts = true;
    this.router.navigate(['/products']);
  }

  /**
   * Next Step (Setup Funds and Manage Reports) Dialog Configuration Wizard.
   */
  openNextStepDialog() {
    const nextStepDialogRef = this.dialog.open( NextStepDialogComponent, {
      data: {
        nextStepName: 'Setup Funds and Manage Reports',
        previousStepName: 'Products',
        stepPercentage: 94
      },
    });
    nextStepDialogRef.afterClosed().subscribe((response: { nextStep: boolean }) => {
    if (response.nextStep) {
      this.configurationWizardService.showRecurringDepositProductsPage = false;
      this.configurationWizardService.showRecurringDepositProductsList = false;
      this.configurationWizardService.showManageFunds = true;
      this.router.navigate(['/organization']);
      } else {
      this.configurationWizardService.showRecurringDepositProductsPage = false;
      this.configurationWizardService.showRecurringDepositProductsList = false;
      this.router.navigate(['/home']);
      }
    });
  }
}
