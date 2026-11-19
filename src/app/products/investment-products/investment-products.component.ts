/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/* eslint-disable @angular-eslint/prefer-inject -- Repository UI skill requires constructor injection of FormBuilder. */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { RouterModule } from '@angular/router';
import { SharedModule } from 'app/shared/shared.module';
import { HasPermissionDirective } from 'app/directives/has-permission/has-permission.directive';
import { CatalogEntry } from './investment-product.models';
import { InvestmentProductService, investmentError } from './investment-product.service';
import { InvestmentAccessService } from './investment-access.service';
import { InvestmentCodePipe, InvestmentFeedbackComponent } from './investment-feedback.component';
@Component({
  selector: 'mifosx-investment-products',
  standalone: true,
  imports: [
    RouterModule,
    SharedModule,
    HasPermissionDirective,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    InvestmentCodePipe,
    InvestmentFeedbackComponent
  ],
  templateUrl: './investment-products.component.html',
  styleUrls: ['./investment-products.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InvestmentProductsComponent implements OnInit {
  access = inject(InvestmentAccessService);
  private service = inject(InvestmentProductService);
  private destroyRef = inject(DestroyRef);
  loading = signal(false);
  error = signal('');
  source = new MatTableDataSource<CatalogEntry>();
  columns = [
    'name',
    'type',
    'currency',
    'term',
    'amount',
    'status',
    'rate',
    'actions'
  ];
  filters;
  constructor(fb: FormBuilder) {
    this.filters = fb.nonNullable.group({ search: '', type: '' });
    this.source.filterPredicate = (entry, filter) => {
      const { search, type } = JSON.parse(filter);
      return (
        entry.native.name.toLowerCase().includes(search.toLowerCase()) &&
        (!type ||
          (type === 'UNCONFIGURED'
            ? entry.configuration?.status === type
            : entry.configuration?.policy?.investmentType === type))
      );
    };
    this.source.sortingDataAccessor = (entry, column) =>
      column === 'name'
        ? entry.native.name.toLowerCase()
        : column === 'type'
          ? (entry.configuration?.policy?.investmentType ?? '')
          : column === 'status'
            ? (entry.configuration?.status ?? '')
            : column === 'currency'
              ? (entry.configuration?.nativeProduct.currencyCode ?? '')
              : '';
    this.filters.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.source.filter = JSON.stringify(this.filters.getRawValue());
      this.source.paginator?.firstPage();
    });
  }
  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this.source.paginator = value;
  }
  @ViewChild(MatSort) set sort(value: MatSort) {
    this.source.sort = value;
  }
  ngOnInit() {
    this.load();
  }
  load() {
    if (this.loading()) return;
    if (
      !this.access.has('READ_FIXEDDEPOSITPRODUCT') ||
      (!this.access.has('READ_INVESTMENT_PRODUCT_POLICY') && !this.access.has('READ_INVESTMENT_RATE'))
    ) {
      this.error.set('Investment.forbidden');
      return;
    }
    this.loading.set(true);
    this.error.set('');
    this.service
      .catalog()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (entries) => {
          this.source.data = entries;
          this.loading.set(false);
        },
        error: (error) => {
          this.error.set(investmentError(error));
          this.loading.set(false);
        }
      });
  }
}
