/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  TemplateRef,
  ElementRef,
  ViewChild,
  AfterViewInit,
  inject
} from '@angular/core';
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
import { ActivatedRoute } from '@angular/router';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { ProductsService } from '../products.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { MatMenu, MatMenuTrigger, MatMenuItem } from '@angular/material/menu';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { UntypedFormControl } from '@angular/forms';
import { LOAN_PRODUCT_TYPE, PRODUCT_TYPES } from './models/loan-product.model';
import { LoanProductBaseComponent } from './common/loan-product-base.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'mifosx-loan-products',
  templateUrl: './loan-products.component.html',
  styleUrls: ['./loan-products.component.scss'],
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
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    StatusLookupPipe,
    DateFormatPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanProductsComponent extends LoanProductBaseComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);
  private productsService = inject(ProductsService);

  loanProductSelector = new UntypedFormControl();

  /**
   * Production mode (MIFOS_PRODUCTION_MODE) - hides the Convenient loan product creation flow,
   * leaving Classic as the only way to create a loan product.
   */
  productionMode = environment.productionMode === true;

  loanProductsData: any;
  displayedColumns: string[] = [
    'name',
    'shortName',
    'closeDate',
    'status'
  ];
  dataSource: MatTableDataSource<any>;
  loanProductOptions: any = PRODUCT_TYPES;

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
  constructor() {
    super();

    const productType = this.route.snapshot.queryParamMap.get('productType') || 'loan';
    this.loanProductService.initialize(productType);

    this.route.data.subscribe((data: { loanProducts: any }) => {
      this.loanProductsData = data.loanProducts;
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.loanProductsData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.loanProductSelector.patchValue(this.loanProductOptions[0].type);
    this.fetchProducts();
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showLoanProductsPage) {
      setTimeout(() => {
        this.showPopover(
          this.templateButtonCreateLoanProduct,
          this.buttonCreateLoanProduct.nativeElement,
          'bottom',
          true
        );
      });
    }

    if (this.configurationWizardService.showLoanProductsList) {
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
  showPopover(
    template: TemplateRef<any>,
    target: HTMLElement | ElementRef<any>,
    position: string,
    backdrop: boolean
  ): void {
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

  fetchProducts(): void {
    const productType: string = this.loanProductSelector.value === LOAN_PRODUCT_TYPE.LOAN ? '' : 'workingcapital';
    if (productType === '') {
      this.loanProductService.initialize(LOAN_PRODUCT_TYPE.LOAN);
    } else {
      this.loanProductService.initialize(LOAN_PRODUCT_TYPE.WORKING_CAPITAL);
    }
    this.loanProductsData = [];
    this.dataSource.data = this.loanProductsData;
    this.productsService.getLoanProducts(this.loanProductService.loanProductPath).subscribe({
      next: (data: any) => {
        this.loanProductsData = data;
        this.dataSource.data = this.loanProductsData;
      },
      error: () => {
        // Error already handled by ErrorHandlerService
      }
    });
  }
}
