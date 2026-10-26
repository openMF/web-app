/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  ViewChild,
  inject,
  signal
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import {
  MatCell,
  MatCellDef,
  MatColumnDef,
  MatHeaderCell,
  MatHeaderCellDef,
  MatHeaderRow,
  MatHeaderRowDef,
  MatRow,
  MatRowDef,
  MatTable
} from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** rxjs Imports */
import { debounceTime, distinctUntilChanged, merge } from 'rxjs';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { TenantManagementService } from './tenant-management.service';

/** Custom Models */
import { Tenant } from './models/tenant.model';
import { TenantsDataSource } from './tenants.datasource';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Delay before a typed search term is sent, in milliseconds. */
const SEARCH_DEBOUNCE = 400;

/**
 * Tenants list.
 *
 * Search, status filter and paging all happen on the server. The table is not sortable because the
 * API offers no sort parameter; rows come back in the registry's own order.
 */
@Component({
  selector: 'mifosx-tenants',
  templateUrl: './tenants.component.html',
  styleUrls: ['./tenants.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantsComponent implements OnInit, AfterViewInit {
  private tenantManagementService = inject(TenantManagementService);
  private settingsService = inject(SettingsService);
  private destroyRef = inject(DestroyRef);

  /** Columns to be displayed in the tenants table. */
  displayedColumns: string[] = [
    'identifier',
    'name',
    'status',
    'schemaName',
    'createdDate'
  ];

  /** Data source for the tenants table. */
  dataSource: TenantsDataSource;

  /** Search term, matched against identifier and name. */
  searchControl = new FormControl('');
  /** Status to restrict the list to, empty for all. */
  statusControl = new FormControl('');

  /** Statuses offered by the backend, never hardcoded here. */
  readonly statuses = signal<string[]>([]);

  /** Paginator for the tenants table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  ngOnInit(): void {
    this.dataSource = new TenantsDataSource(this.tenantManagementService);
    this.tenantManagementService.getTemplate().subscribe((template) => {
      this.statuses.set(template.statuses ?? []);
    });
    this.dataSource.tenants$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tenants: Tenant[]) => this.rememberIdentifiers(tenants));
    this.loadTenants();
  }

  ngAfterViewInit(): void {
    merge(
      this.searchControl.valueChanges.pipe(debounceTime(SEARCH_DEBOUNCE), distinctUntilChanged()),
      this.statusControl.valueChanges
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        // A narrower filter can leave the current page beyond the end of the result.
        this.paginator.pageIndex = 0;
        this.loadTenants();
      });

    this.paginator.page.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.loadTenants());
  }

  loadTenants(): void {
    this.dataSource.getTenants(
      this.searchControl.value ?? '',
      this.statusControl.value ?? '',
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }

  /**
   * Remembers the identifiers for the login page's tenant selector.
   *
   * Only a complete, unfiltered list is cached: a filtered result or one page of a longer list is
   * not the set of tenants on this installation, and writing it would make the selector claim the
   * others do not exist.
   */
  private rememberIdentifiers(tenants: Tenant[]): void {
    const unfiltered = !this.searchControl.value && !this.statusControl.value;
    const complete = tenants.length > 0 && tenants.length >= this.dataSource.totalRecords;
    if (unfiltered && complete) {
      this.settingsService.setDiscoveredTenantIdentifiers(tenants.map((tenant: Tenant) => tenant.identifier));
    }
  }
}
