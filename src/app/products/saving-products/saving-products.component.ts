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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-saving-products',
  templateUrl: './saving-products.component.html',
  styleUrls: ['./saving-products.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
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
    MatPaginator
  ]
})
export class SavingProductsComponent implements OnInit, AfterViewInit {
  savingProductsData: any;
  displayedColumns: string[] = [
    'name',
    'shortName'
  ];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /* Reference of create saving products button */
  @ViewChild('buttonSavingProduct') buttonSavingProduct: ElementRef<any>;
  /* Template for popover on creare saving products button */
  @ViewChild('templateButtonSavingProduct') templateButtonSavingProduct: TemplateRef<any>;
  /* Reference of saving products table */
  @ViewChild('savingProductTable') savingProductTable: ElementRef<any>;
  /* Template for popover on saving products table */
  @ViewChild('templateSavingProductTable') templateSavingProductTable: TemplateRef<any>;

  /**
   * @param {ActivatedRoute} route ActivatedRoute.
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
    this.route.data.subscribe((data: { savingProducts: any }) => {
      this.savingProductsData = data.savingProducts;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.savingProductsData);
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
    if (this.configurationWizardService.showSavingsProductsPage === true) {
      setTimeout(() => {
        this.showPopover(this.templateButtonSavingProduct, this.buttonSavingProduct.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showSavingsProductsList === true) {
      setTimeout(() => {
        this.showPopover(this.templateSavingProductTable, this.savingProductTable.nativeElement, 'top', true);
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
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * Next Step (Share Products - Products Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showSavingsProductsPage = false;
    this.configurationWizardService.showSavingsProductsList = false;
    this.configurationWizardService.showShareProducts = true;
    this.router.navigate(['/products']);
  }

  /**
   * Previous Step (Savings Products Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showSavingsProductsPage = false;
    this.configurationWizardService.showSavingsProductsList = false;
    this.configurationWizardService.showSavingsProducts = true;
    this.router.navigate(['/products']);
  }
}
