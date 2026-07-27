/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatNavList, MatListItem } from '@angular/material/list';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatLine } from '@angular/material/grid-list';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';
import {
  EXTERNAL_SERVICE_REGISTRY,
  ExternalServiceAvailabilityContext,
  ExternalServiceConfiguration,
  getVisibleExternalServices
} from './external-services.config';

/**
 * External Services component.
 */
@Component({
  selector: 'mifosx-external-services',
  templateUrl: './external-services.component.html',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatNavList,
    MatListItem,
    MatIcon,
    MatIconButton,
    FaIconComponent,
    MatLine
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExternalServicesComponent {
  private readonly authenticationService = inject(AuthenticationService);
  private readonly availabilityContext: ExternalServiceAvailabilityContext = {};
  private readonly userPermissions: string[];
  private readonly expandedServiceIds = new Set<string>();

  externalServices: ExternalServiceConfiguration[];
  serviceColumns: ExternalServiceConfiguration[][];

  constructor() {
    this.userPermissions = this.authenticationService.getCredentials()?.permissions ?? [];
    this.externalServices = getVisibleExternalServices(
      EXTERNAL_SERVICE_REGISTRY,
      this.availabilityContext,
      this.userPermissions,
      environment.productionModeEnableRBAC
    );
    this.serviceColumns = this.getServiceColumns(this.externalServices);
  }

  getServiceColumns(services: ExternalServiceConfiguration[]): ExternalServiceConfiguration[][] {
    const columnSize = Math.ceil(services.length / 2);
    if (!columnSize) {
      return [];
    }
    return [
      services.slice(0, columnSize),
      services.slice(columnSize)
    ].filter((column: ExternalServiceConfiguration[]) => column.length > 0);
  }

  /**
   * Toggles a service description.
   * @param serviceId Service identifier.
   */
  toggleServiceDescription(serviceId: string): void {
    if (this.expandedServiceIds.has(serviceId)) {
      this.expandedServiceIds.delete(serviceId);
    } else {
      this.expandedServiceIds.add(serviceId);
    }
  }

  isServiceDescriptionVisible(serviceId: string): boolean {
    return this.expandedServiceIds.has(serviceId);
  }
}
