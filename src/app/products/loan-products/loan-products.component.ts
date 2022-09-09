/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

@Component({
  selector: 'mifosx-loan-products',
  templateUrl: './loan-products.component.html',
  styleUrls: ['./loan-products.component.scss']
})
export class LoanProductsComponent implements OnInit, AfterViewInit {

  loanProductsData: any;
  displayedColumns: string[] = ['name', 'shortName', 'closeDate', 'status'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create loan product button */
  @ViewChild('buttonCreateLoanProduct') buttonCreateLoanProduct: ElementRef<any>;
  /* Template for popover on create loan product button */
  @ViewChild('templateButtonCreateLoanProduct') templateButtonCreateLoanProduct: TemplateRef<any>;
  /* Reference of loan products table */
  @ViewChild('loanProductsTable') loanProductsTable: ElementRef<any>;
  /* Template for popover on loan products table */
  @ViewChild('templateLoanProductsTable') templateLoanProductsTable: TemplateRef<any>;

  /**
   * @param {ActivatedRoute} route ActivatedRoute.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe((data: { loanProducts: any }) => {
      this.loanProductsData = data.loanProducts;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.loanProductsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showLoanProductsPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonCreateLoanProduct, this.buttonCreateLoanProduct.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showLoanProductsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateLoanProductsTable, this.loanProductsTable.nativeElement, 'top', true);
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
   * Next Step (Savings Products - Products Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showLoanProductsPage = false;
    this.configurationWizardService.showLoanProductsList = false;
    this.configurationWizardService.showSavingsProducts = true;
    this.router.navigate(['/products']);
  }

  /**
   * PRevious Step (Loan Products - Products Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showLoanProductsPage = false;
    this.configurationWizardService.showLoanProductsList = false;
    this.configurationWizardService.showLoanProducts = true;
    this.router.navigate(['/products']);
  }
}
