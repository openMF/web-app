/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Custom Services */
import { TenantManagementService } from '../tenant-management.service';

/** Custom Models */
import { Tenant } from '../models/tenant.model';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Tenant Component.
 *
 * The tenant is fetched here rather than in a route resolver: the master credential may not exist
 * when this route activates, and a resolver would fire an unauthenticated request before the
 * section's sign-in card had a chance to render.
 */
@Component({
  selector: 'mifosx-view-tenant',
  templateUrl: './view-tenant.component.html',
  styleUrls: ['./view-tenant.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTenantComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private tenantManagementService = inject(TenantManagementService);

  /** The tenant being viewed, or `null` while it is being fetched. */
  readonly tenant = signal<Tenant | null>(null);

  ngOnInit(): void {
    const tenantId = this.route.snapshot.paramMap.get('id');
    this.tenantManagementService.getTenant(tenantId).subscribe((tenant: Tenant) => this.tenant.set(tenant));
  }
}
