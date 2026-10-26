/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable, inject } from '@angular/core';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { AnalyticsVisibilityRule } from '../models/analytics-dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class AnalyticsVisibilityService {
  private authenticationService = inject(AuthenticationService);

  canView(rule?: AnalyticsVisibilityRule): boolean {
    if (!rule) {
      return true;
    }

    const credentials = this.authenticationService.getCredentials();
    if (!credentials) {
      return false;
    }

    const userPermissions = credentials.permissions || [];
    const userRoles = this.extractRoleNames(credentials.roles);

    if (userPermissions.includes('ALL_FUNCTIONS')) {
      return true;
    }

    if (rule.roles?.length && !rule.roles.some((role) => userRoles.includes(role))) {
      return false;
    }

    if (
      rule.permissionsAll?.length &&
      !rule.permissionsAll.every((permission) => this.hasPermission(permission, userPermissions))
    ) {
      return false;
    }

    if (
      rule.permissionsAny?.length &&
      !rule.permissionsAny.some((permission) => this.hasPermission(permission, userPermissions))
    ) {
      return false;
    }

    return true;
  }

  private hasPermission(permission: string, userPermissions: string[]): boolean {
    if (userPermissions.includes(permission)) {
      return true;
    }

    if (permission.startsWith('READ_') && userPermissions.includes('ALL_FUNCTIONS_READ')) {
      return true;
    }

    return false;
  }

  private extractRoleNames(roles: any): string[] {
    if (!Array.isArray(roles)) {
      return [];
    }

    return roles
      .map((role: any) => {
        if (typeof role === 'string') {
          return role;
        }

        return role?.name || role?.displayName || role?.roleName || '';
      })
      .filter((role: string) => role !== '');
  }
}
