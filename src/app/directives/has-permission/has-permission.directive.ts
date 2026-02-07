/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Directive, Input, TemplateRef, ViewContainerRef, inject } from '@angular/core';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';

/** Environment */
import { environment } from '../../../environments/environment';

/**
 * Has Permission Directive
 */
@Directive({ selector: '[mifosxHasPermission]', standalone: true })
export class HasPermissionDirective {
  private templateRef = inject<TemplateRef<any>>(TemplateRef);
  private viewContainer = inject(ViewContainerRef);
  private authenticationService = inject(AuthenticationService);

  /** User Permissions */
  private userPermissions: any[];

  /** RBAC Feature Flag */
  private rbacEnabled: boolean = environment.productionModeEnableRBAC;

  /**
   * Extracts User Permissions from User Credentials
   * @param {TemplateRef} templateRef Template Reference
   * @param {ViewContainerRef} viewContainer View Container Reference
   * @param {AuthenticationService} authenticationService AuthenticationService
   */
  constructor() {
    const savedCredentials = this.authenticationService.getCredentials();
    this.userPermissions = savedCredentials.permissions;
  }

  /**
   * Evaluates the condition to show template.
   */
  @Input()
  set mifosxHasPermission(permission: any) {
    if (typeof permission !== 'string') {
      throw new Error('hasPermission value must be a string');
    }
    /** Clear the template beforehand to prevent overlap OnChanges. */
    this.viewContainer.clear();
    /** Shows Template if user has permission */
    if (this.hasPermission(permission)) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    }
  }

  /**
   * Checks if user is permitted.
   * @param {string} permission Permission
   * @returns {true}
   * - RBAC is disabled (backward compatibility mode)
   * -`ALL_FUNCTIONS`: user is a Super user.
   * -`ALL_FUNCTIONS_READ`: user has all read permissions and passed permission is 'read' type.
   * - User has special permission to access that feature.
   * @returns {false}
   * - Passed permission doesn't fall under either of above given permission grants.
   * - No value was passed to the has permission directive.
   */
  private hasPermission(permission: string) {
    // If RBAC is disabled, show all menus/buttons (backward compatibility)
    if (!this.rbacEnabled) {
      return true;
    }

    permission = permission.trim();
    if (this.userPermissions.includes('ALL_FUNCTIONS')) {
      return true;
    } else if (permission !== '') {
      if (permission.substring(0, 5) === 'READ_' && this.userPermissions.includes('ALL_FUNCTIONS_READ')) {
        return true;
      } else if (this.userPermissions.includes(permission)) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  }
}
