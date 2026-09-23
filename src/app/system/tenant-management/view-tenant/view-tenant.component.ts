/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Translation Imports */
import { TranslateService } from '@ngx-translate/core';

/** Custom Dialogs */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Services */
import { TenantManagementService } from '../tenant-management.service';

/** Custom Models */
import { Tenant, TenantStatusCommand } from '../models/tenant.model';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Which command leaves a tenant in which status. */
const COMMAND_RESULT: Record<TenantStatusCommand, string> = {
  activate: 'ACTIVE',
  deactivate: 'INACTIVE',
  suspend: 'SUSPENDED'
};

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
    FaIconComponent,
    MatTooltip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewTenantComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private tenantManagementService = inject(TenantManagementService);

  private tenantId = this.route.snapshot.paramMap.get('id');

  /** The tenant being viewed, or `null` while it is being fetched. */
  readonly tenant = signal<Tenant | null>(null);

  ngOnInit(): void {
    this.load();
  }

  /**
   * The status commands worth offering.
   *
   * A command that would leave the tenant where it already is changes nothing, so it is left out —
   * except when the stored status is not one the plugin recognises, where all three are offered
   * because setting any of them corrects it.
   */
  availableCommands(): TenantStatusCommand[] {
    const status = this.tenant()?.status;
    const commands: TenantStatusCommand[] = [
      'activate',
      'deactivate',
      'suspend'
    ];
    if (!status) {
      return commands;
    }
    return commands.filter((command: TenantStatusCommand) => COMMAND_RESULT[command] !== status);
  }

  /** An active tenant is still serving users, so removing it is a deliberate two-step action. */
  canDelete(): boolean {
    return this.tenant()?.status !== 'ACTIVE';
  }

  changeStatus(command: TenantStatusCommand): void {
    const tenant = this.tenant();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant(`labels.buttons.${this.commandLabel(command)}`),
        dialogContext: this.translateService.instant(`labels.dialogContext.${this.commandLabel(command)} tenant`, {
          identifier: tenant?.identifier
        }),
        type: command === 'activate' ? 'primary' : 'warn'
      }
    });
    dialogRef.afterClosed().subscribe((response: { confirm?: boolean }) => {
      if (response?.confirm) {
        this.tenantManagementService.changeStatus(this.tenantId, command).subscribe(() => this.load());
      }
    });
  }

  /**
   * Confirms removal.
   *
   * Deliberately not `DeleteDialogComponent`: that one renders its own "are you sure you want to
   * delete" and appends this text to it, and the sentence that produces is ungrammatical in several
   * languages - Czech and Spanish prefixes already carry the object, and German needs it before the
   * verb. Confirming through the same dialog the status commands use means the whole sentence is
   * one translated string, so each language can put the words in its own order.
   */
  delete(): void {
    const tenant = this.tenant();
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Delete'),
        dialogContext: this.translateService.instant('labels.dialogContext.Remove tenant', {
          identifier: tenant?.identifier
        }),
        type: 'warn'
      }
    });
    dialogRef.afterClosed().subscribe((response: { confirm?: boolean }) => {
      if (response?.confirm) {
        this.tenantManagementService.deleteTenant(this.tenantId).subscribe(() =>
          this.router.navigate([
            '/system',
            'tenant-management'
          ])
        );
      }
    });
  }

  private commandLabel(command: TenantStatusCommand): string {
    return command.charAt(0).toUpperCase() + command.slice(1);
  }

  private load(): void {
    this.tenantManagementService.getTenant(this.tenantId).subscribe((tenant: Tenant) => this.tenant.set(tenant));
  }
}
