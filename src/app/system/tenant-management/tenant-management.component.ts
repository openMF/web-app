/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Custom Components */
import { TenantMasterLoginComponent } from './master-login/master-login.component';

/** Custom Services */
import { TenantMasterSessionService } from './tenant-master-session.service';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Tenant management section.
 *
 * Holds the master sign-in gate for every page below it, so a deep link to a tenant shows the
 * sign-in card first and continues to that tenant once the credential is accepted.
 */
@Component({
  selector: 'mifosx-tenant-management',
  templateUrl: './tenant-management.component.html',
  styleUrls: ['./tenant-management.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterOutlet,
    FaIconComponent,
    TenantMasterLoginComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TenantManagementComponent {
  private router = inject(Router);

  readonly session = inject(TenantMasterSessionService);

  /** Drops the master credential and returns to the top of the section. */
  signOut(): void {
    this.session.signOut();
    this.router.navigate([
      '/system',
      'tenant-management'
    ]);
  }
}
