/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit, inject } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
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

/** rxjs Imports */
import { switchMap, catchError, finalize } from 'rxjs/operators';
import { EMPTY } from 'rxjs';

/* Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { ProductsService } from '../products.service';
import { SettingsService } from 'app/settings/settings.service';
import { ErrorHandlerService } from 'app/core/error-handler/error-handler.service';
import { ImportLoanProductDialogComponent } from './import-loan-product-dialog/import-loan-product-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { StatusLookupPipe } from '../../pipes/status-lookup.pipe';
import { DateFormatPipe } from '../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    StatusLookupPipe,
    DateFormatPipe
  ]
})
export class LoanProductsComponent implements OnInit, AfterViewInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);
  private dialog = inject(MatDialog);
  private productsService = inject(ProductsService);
  private settingsService = inject(SettingsService);
  private errorHandler = inject(ErrorHandlerService);

  loanProductsData: any;
  displayedColumns: string[] = [
    'name',
    'shortName',
    'closeDate',
    'status'
  ];
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
  constructor() {
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
        this.showPopover(
          this.templateButtonCreateLoanProduct,
          this.buttonCreateLoanProduct.nativeElement,
          'bottom',
          true
        );
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

  /**
   * Opens the import loan product dialog.
   */
  openImportDialog(): void {
    const importDialogRef = this.dialog.open(ImportLoanProductDialogComponent, {
      width: '50rem'
    });

    importDialogRef.afterClosed().subscribe((response: any) => {
      if (response && response.file) {
        this.importLoanProduct(response.file);
      }
    });
  }

  /**
   * Imports a loan product from a JSON file.
   * @param {File} file The JSON file containing loan product definition.
   */
  importLoanProduct(file: File): void {
    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const loanProductData = JSON.parse(e.target.result);

        // Remove fields that shouldn't be included in creation
        delete loanProductData.id;
        delete loanProductData.status;

        // Add required fields for API with null safety checks
        const locale = this.settingsService.language?.code || 'en';
        const dateFormat = this.settingsService.dateFormat || 'dd MMMM yyyy';

        const payload = {
          ...loanProductData,
          locale,
          dateFormat,
          // Add default required fields if not present
          currencyCode: loanProductData.currencyCode || 'USD',
          digitsAfterDecimal: loanProductData.digitsAfterDecimal ?? 2,
          charges: loanProductData.charges || []
        };

        // Call API to create loan product with proper error handling
        this.productsService
          .createLoanProduct(payload)
          .pipe(
            switchMap(() => this.productsService.getLoanProducts()),
            catchError((error) => this.errorHandler.handleError(error, 'Loan Product Import'))
          )
          .subscribe({
            next: (data: any) => {
              this.loanProductsData = data;
              this.dataSource.data = this.loanProductsData;
              this.errorHandler.showSuccess('Loan product imported successfully!');
            },
            error: () => {
              // Error already handled by ErrorHandlerService
            }
          });
      } catch (error) {
        this.errorHandler.showInfo(
          'The selected file is not a valid JSON file. Please check the file format and try again.'
        );
      }
    };

    reader.readAsText(file);
  }
}
