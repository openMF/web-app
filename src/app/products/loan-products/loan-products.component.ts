/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
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

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  @ViewChild('buttonCreateLoanProduct') buttonCreateLoanProduct: ElementRef<any>;
  @ViewChild('templateButtonCreateLoanProduct') templateButtonCreateLoanProduct: TemplateRef<any>;
  @ViewChild('loanProductsTable') loanProductsTable: ElementRef<any>;
  @ViewChild('templateLoanProductsTable') templateLoanProductsTable: TemplateRef<any>;

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

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  nextStep() {
    this.configurationWizardService.showLoanProductsPage = false;
    this.configurationWizardService.showLoanProductsList = false;
    this.configurationWizardService.showSavingsProducts = true;
    this.router.navigate(['/products']);
  }

  previousStep() {
    this.configurationWizardService.showLoanProductsPage = false;
    this.configurationWizardService.showLoanProductsList = false;
    this.configurationWizardService.showLoanProducts = true;
    this.router.navigate(['/products']);
  }
}
