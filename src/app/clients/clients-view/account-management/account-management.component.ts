/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, distinctUntilChanged, filter, fromEvent, map, merge, startWith } from 'rxjs';
import { SettingsService } from 'app/settings/settings.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { MatTabsModule } from '@angular/material/tabs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AccountManagementAccess } from './account-management-access.service';
import { MainAccountComponent } from './main-account.component';
import { GuaranteedAccountsComponent } from './guaranteed-accounts.component';
import { PlannedMainAccountComponent } from './planned-main-account.component';
import { SavingsPocketsComponent } from './savings-pockets.component';
import { ConsolidatedIsrComponent } from './consolidated-isr.component';
import { positiveId } from './account-management.state';

@Component({
  selector: 'mifosx-account-management',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTabsModule,
    MainAccountComponent,
    GuaranteedAccountsComponent,
    PlannedMainAccountComponent,
    SavingsPocketsComponent,
    ConsolidatedIsrComponent
  ],
  templateUrl: './account-management.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AccountManagementComponent {
  readonly access = inject(AccountManagementAccess);
  private readonly settings = inject(SettingsService);
  private readonly auth = inject(AuthenticationService);
  private readonly initialContext = this.context();
  readonly contextInvalid = signal(false);
  private context(): string {
    return JSON.stringify([
      this.settings.server,
      this.settings.tenantIdentifier,
      this.auth.getCredentials()?.userId
    ]);
  }
  readonly customer$ = combineLatest([
    inject(ActivatedRoute).parent.paramMap,
    merge(
      fromEvent<StorageEvent>(window, 'storage').pipe(
        filter(
          (event) => !event.key || [
              'mifosXServerURL',
              'mifosXTenantIdentifier',
              'mifosXCredentials'
            ].includes(event.key)
        )
      ),
      this.auth.isAuthenticated$
    ).pipe(startWith(null))
  ]).pipe(
    map(([params]) => {
      // A changed context cannot reuse an existing client's view. Reauthentication/reload is required.
      this.contextInvalid.set(this.contextInvalid() || this.context() !== this.initialContext);
      return this.contextInvalid() ? 0 : Number(params.get('clientId'));
    }),
    distinctUntilChanged(),
    map((id) => (positiveId(id) ? [id] : []))
  );
}
