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
  ChangeDetectorRef,
  DestroyRef,
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
import { Router } from '@angular/router';
import { FormBuilder } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, map, of, startWith, switchMap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatProgressBar } from '@angular/material/progress-bar';
import { SavingProductListService } from './saving-product-list.service';
import { CLASSIFICATION_LABELS, SavingsProductRow } from './saving-product-list.model';

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
    MatPaginator,
    MatProgressBar
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SavingProductsComponent implements OnInit, AfterViewInit {
  private listService = inject(SavingProductListService);
  private router = inject(Router);
  protected configurationWizardService = inject(ConfigurationWizardService);
  private popoverService = inject(PopoverService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private changeDetector = inject(ChangeDetectorRef);
  private reload = new Subject<void>();

  filters = this.formBuilder.nonNullable.group({ search: '', classification: '' });
  classifications = Object.entries(CLASSIFICATION_LABELS);
  loading = true;
  error: 'forbidden' | 'failed' | null = null;
  warning: 'unavailable' | 'forbidden' | null = null;
  displayedColumns = [
    'name',
    'shortName',
    'classification',
    'currency',
    'interest',
    'status',
    'actions'
  ];
  dataSource = new MatTableDataSource<SavingsProductRow>([]);

  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  @ViewChild(MatSort) set sort(value: MatSort) {
    this.dataSource.sort = value;
  }

  /* Reference of create saving products button */
  @ViewChild('buttonSavingProduct') buttonSavingProduct: ElementRef<any>;
  /* Template for popover on creare saving products button */
  @ViewChild('templateButtonSavingProduct') templateButtonSavingProduct: TemplateRef<any>;
  /* Reference of saving products table */
  @ViewChild('savingProductTable') savingProductTable: ElementRef<any>;
  /* Template for popover on saving products table */
  @ViewChild('templateSavingProductTable') templateSavingProductTable: TemplateRef<any>;

  ngOnInit() {
    this.dataSource.filterPredicate = (product, filter) => {
      const { search, classification } = JSON.parse(filter);
      return (
        product.name.toLowerCase().includes(search) && (!classification || product.classification === classification)
      );
    };
    this.filters.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.applyFilters();
    });
    this.reload
      .pipe(
        startWith(undefined),
        switchMap(() => {
          this.loading = true;
          this.error = null;
          this.warning = null;
          this.dataSource.data = [];
          return this.listService.load().pipe(
            map((result) => ({ result, error: null as 'forbidden' | 'failed' | null })),
            catchError((error: unknown) =>
              of({
                result: null,
                error:
                  error instanceof HttpErrorResponse && (error.status === 401 || error.status === 403)
                    ? ('forbidden' as const)
                    : ('failed' as const)
              })
            )
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ result, error }) => {
        this.loading = false;
        this.error = error;
        this.warning = result?.warning ?? null;
        this.dataSource.data = result?.products ?? [];
        this.applyFilters();
        this.changeDetector.markForCheck();
      });
  }

  private applyFilters() {
    const { search, classification } = this.filters.getRawValue();
    this.dataSource.filter = JSON.stringify({ search: search.trim().toLowerCase(), classification });
    this.dataSource.paginator?.firstPage();
  }

  clearFilters() {
    this.filters.reset({ search: '', classification: '' });
  }

  retry() {
    this.reload.next();
  }

  interestRate(product: SavingsProductRow): number | null {
    return typeof product.nominalAnnualInterestRate === 'number' && Number.isFinite(product.nominalAnnualInterestRate)
      ? product.nominalAnnualInterestRate
      : null;
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showSavingsProductsPage) {
      setTimeout(() => {
        this.showPopover(this.templateButtonSavingProduct, this.buttonSavingProduct.nativeElement, 'bottom', true);
      });
    }

    if (this.configurationWizardService.showSavingsProductsList) {
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
