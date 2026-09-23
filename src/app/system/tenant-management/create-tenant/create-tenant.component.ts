/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** rxjs Imports */
import { finalize, takeUntil } from 'rxjs';
import { MatProgressBar } from '@angular/material/progress-bar';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Custom Components */
import { InputPasswordComponent } from 'app/shared/input-password/input-password.component';

/** Custom Services */
import { TenantManagementService } from '../tenant-management.service';

/** Custom Helpers */
import { connectionProbeVerdict } from '../connection-probe-verdict';

/** Custom Models */
import {
  CreateTenantPayload,
  TENANT_IDENTIFIER_PATTERN,
  TENANT_PORT_MAX,
  TENANT_PORT_MIN,
  TENANT_SCHEMA_NAME_PATTERN,
  Tenant,
  TestConnectionPayload,
  TestConnectionResponse
} from '../models/tenant.model';

/** Environment Configuration */
import { environment } from '../../../../environments/environment';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Tenant Component.
 *
 * Registering a tenant creates and migrates its database, so this form commits more than a row: a
 * connection can be proved first with Test connection, and the submit reports progress because the
 * backend does the work synchronously and takes the better part of a minute.
 */
@Component({
  selector: 'mifosx-create-tenant',
  templateUrl: './create-tenant.component.html',
  styleUrls: ['./create-tenant.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
    MatProgressBar,
    InputPasswordComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CreateTenantComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tenantManagementService = inject(TenantManagementService);

  /** Selectable values the backend owns. */
  readonly timezones = signal<string[]>([]);
  readonly statuses = signal<string[]>([]);

  /** True while the tenant is being provisioned. */
  readonly submitting = signal(false);
  /** True while the database is being probed. */
  readonly testing = signal(false);
  /** The last probe, or `null` if none has been made since the details changed. */
  readonly probe = signal<TestConnectionResponse | null>(null);

  /**
   * What that probe means here.
   *
   * A database that does not exist yet is the ordinary state on this form - it is created on
   * submit - so it reads as a confirmation rather than a failure.
   */
  readonly verdict = computed(() => {
    const probe = this.probe();
    return probe ? connectionProbeVerdict(probe, false) : null;
  });

  tenantForm = this.formBuilder.group({
    identifier: [
      '',
      [
        Validators.required,
        Validators.pattern(TENANT_IDENTIFIER_PATTERN)
      ]
    ],
    name: [
      '',
      Validators.required
    ],
    timezoneId: [
      '',
      Validators.required
    ],
    description: [''],
    contactEmail: [
      '',
      Validators.pattern(environment.externalEmailRegex)
    ],
    status: ['ACTIVE']
  });

  connectionForm = this.formBuilder.group({
    schemaName: [
      '',
      [
        Validators.required,
        Validators.pattern(TENANT_SCHEMA_NAME_PATTERN)
      ]
    ],
    schemaServer: [
      '',
      Validators.required
    ],
    schemaServerPort: [
      '5432',
      [
        Validators.required,
        Validators.min(TENANT_PORT_MIN),
        Validators.max(TENANT_PORT_MAX)
      ]
    ],
    schemaUsername: [
      '',
      Validators.required
    ],
    schemaPassword: [
      '',
      Validators.required
    ],
    schemaConnectionParameters: [''],
    autoUpdate: [true]
  });

  ngOnInit(): void {
    this.tenantManagementService.getTemplate().subscribe((template) => {
      this.timezones.set(template.timezones ?? []);
      this.statuses.set(template.statuses ?? []);
    });

    // A probe describes the details it was made with, so it stops meaning anything once they change.
    this.connectionForm.valueChanges.subscribe(() => this.probe.set(null));
  }

  /**
   * Probes the database before anything is committed.
   *
   * Since MX-421 this answers even when the database does not exist yet: the backend falls back to
   * asking the server itself, so the credentials can be checked before the tenant is created.
   */
  testConnection(): void {
    if (this.connectionForm.invalid || this.testing()) {
      return;
    }
    this.testing.set(true);
    this.probe.set(null);
    const connection = this.connectionForm.getRawValue();
    const payload: TestConnectionPayload = {
      schemaName: connection.schemaName,
      schemaServer: connection.schemaServer,
      schemaServerPort: `${connection.schemaServerPort}`,
      schemaUsername: connection.schemaUsername,
      schemaPassword: connection.schemaPassword,
      schemaConnectionParameters: connection.schemaConnectionParameters || undefined
    };
    /*
     * takeUntil cancels a probe the moment the details it described change, and finalize clears the
     * spinner however the subscription ends. Without it a slow answer could arrive after the user
     * had edited the field and set `probe` again, so the form would report a password as proven
     * that was never sent anywhere - which is precisely what this check exists to prevent.
     */
    this.tenantManagementService
      .testConnection(payload)
      .pipe(
        takeUntil(this.connectionForm.valueChanges),
        finalize(() => this.testing.set(false))
      )
      .subscribe({
        next: (response: TestConnectionResponse) => this.probe.set(response),
        // The service has already reported the failure.
        error: () => undefined
      });
  }

  submit(): void {
    if (this.tenantForm.invalid || this.connectionForm.invalid || this.submitting()) {
      return;
    }
    this.submitting.set(true);
    const tenant = this.tenantForm.getRawValue();
    const connection = this.connectionForm.getRawValue();
    const payload: CreateTenantPayload = {
      identifier: tenant.identifier,
      name: tenant.name,
      timezoneId: tenant.timezoneId,
      description: tenant.description || undefined,
      contactEmail: tenant.contactEmail || undefined,
      status: tenant.status || undefined,
      schemaName: connection.schemaName,
      schemaServer: connection.schemaServer,
      schemaServerPort: `${connection.schemaServerPort}`,
      schemaUsername: connection.schemaUsername,
      schemaPassword: connection.schemaPassword,
      schemaConnectionParameters: connection.schemaConnectionParameters || undefined,
      autoUpdate: connection.autoUpdate
    };
    this.tenantManagementService.createTenant(payload).subscribe({
      next: (created: Tenant) => {
        this.router.navigate(
          [
            '../',
            created.id
          ],
          { relativeTo: this.route }
        );
      },
      error: () => this.submitting.set(false)
    });
  }
}
