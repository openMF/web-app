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
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Custom Components */
import { InputPasswordComponent } from 'app/shared/input-password/input-password.component';

/** Custom Services */
import { TenantManagementService } from '../tenant-management.service';

/** Custom Helpers */
import { connectionProbeVerdict } from '../connection-probe-verdict';

/** Custom Models */
import {
  TENANT_PORT_MAX,
  TENANT_PORT_MIN,
  Tenant,
  TestConnectionPayload,
  TestConnectionResponse,
  UpdateTenantPayload
} from '../models/tenant.model';

/** Environment Configuration */
import { environment } from '../../../../environments/environment';

/** Shared Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Edit Tenant Component.
 *
 * `identifier` and `schemaName` are shown but not editable: the identifier is how every request
 * selects a tenant and is embedded in its existing sessions and integrations, and the schema is
 * where its data already lives. The backend rejects an identifier sent here rather than ignoring it.
 */
@Component({
  selector: 'mifosx-edit-tenant',
  templateUrl: './edit-tenant.component.html',
  styleUrls: ['./edit-tenant.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
    InputPasswordComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditTenantComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private tenantManagementService = inject(TenantManagementService);

  private tenantId = this.route.snapshot.paramMap.get('id');

  readonly tenant = signal<Tenant | null>(null);
  readonly timezones = signal<string[]>([]);
  readonly submitting = signal(false);
  readonly testing = signal(false);
  readonly probe = signal<TestConnectionResponse | null>(null);

  /**
   * What that probe means here.
   *
   * This tenant's database is supposed to exist, so a server that answers without holding it is a
   * problem worth naming rather than the ordinary state it is on the create form.
   */
  readonly verdict = computed(() => {
    const probe = this.probe();
    return probe ? connectionProbeVerdict(probe, true) : null;
  });

  tenantForm = this.formBuilder.group({
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
    ]
  });

  connectionForm = this.formBuilder.group({
    schemaServer: [
      '',
      Validators.required
    ],
    schemaServerPort: [
      '',
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
    /** Blank means keep the stored password, so it carries no required validator here. */
    schemaPassword: [''],
    schemaConnectionParameters: [''],
    autoUpdate: [true]
  });

  ngOnInit(): void {
    this.tenantManagementService.getTemplate().subscribe((template) => this.timezones.set(template.timezones ?? []));

    this.tenantManagementService.getTenant(this.tenantId).subscribe((tenant: Tenant) => {
      this.tenant.set(tenant);
      this.tenantForm.patchValue({
        name: tenant.name,
        timezoneId: tenant.timezoneId,
        description: tenant.description ?? '',
        contactEmail: tenant.contactEmail ?? ''
      });
      this.connectionForm.patchValue({
        schemaServer: tenant.connection?.schemaServer ?? '',
        schemaServerPort: tenant.connection?.schemaServerPort ?? '',
        schemaUsername: tenant.connection?.schemaUsername ?? '',
        schemaConnectionParameters: tenant.connection?.schemaConnectionParameters ?? '',
        autoUpdate: tenant.connection?.autoUpdate ?? true
      });
    });

    this.connectionForm.valueChanges.subscribe(() => this.probe.set(null));
  }

  /**
   * Whether the database can be probed.
   *
   * The probe needs a password, and the stored one is never returned, so it can only run once one
   * has been typed here.
   */
  canTestConnection(): boolean {
    return this.connectionForm.valid && !!this.connectionForm.controls.schemaPassword.value && !this.testing();
  }

  testConnection(): void {
    if (!this.canTestConnection()) {
      return;
    }
    this.testing.set(true);
    this.probe.set(null);
    const connection = this.connectionForm.getRawValue();
    const payload: TestConnectionPayload = {
      schemaName: this.tenant()?.connection?.schemaName,
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

  /**
   * Whether anything that decides reachability has been touched.
   *
   * A typed password counts, and so does the host, port, user or connection parameters: sending the
   * stored password to a different host, or using it as a different user, fails exactly the way a
   * wrong password does. `autoUpdate` is deliberately absent - it decides whether migrations run,
   * not whether the database can be reached.
   */
  connectionChanged(): boolean {
    const stored = this.tenant()?.connection;
    const current = this.connectionForm.getRawValue();
    if (current.schemaPassword) {
      return true;
    }
    return (
      current.schemaServer !== (stored?.schemaServer ?? '') ||
      `${current.schemaServerPort}` !== (stored?.schemaServerPort ?? '') ||
      current.schemaUsername !== (stored?.schemaUsername ?? '') ||
      (current.schemaConnectionParameters ?? '') !== (stored?.schemaConnectionParameters ?? '')
    );
  }

  /**
   * Whether the details as they now stand have been shown to work.
   *
   * Changed details are not refused by the backend: it proves the connection when a tenant is
   * created but not when one is updated, so they are accepted and then fail at the next platform
   * restart - where core refuses to start at all if any tenant cannot be migrated. One mistyped
   * character takes the whole installation down, so this form proves them before it will send them.
   *
   * The test is the verdict, not `credentialsAccepted` alone: a server that takes the credentials
   * but does not hold this tenant's database is reported as a failure above, and saving details
   * that point away from the tenant's data is the same kind of mistake.
   */
  connectionProven(): boolean {
    return !this.connectionChanged() || this.verdict()?.tone === 'success';
  }

  /**
   * Builds the update.
   *
   * The required fields are always sent, since the form cannot leave them blank and the backend
   * refuses a blank one. The optional text fields are always sent too, because an empty string is
   * how they are cleared. The password is sent only when one has been typed: omitting it is what
   * keeps the stored credential.
   */
  submit(): void {
    if (this.tenantForm.invalid || this.connectionForm.invalid || this.submitting() || !this.connectionProven()) {
      return;
    }
    this.submitting.set(true);
    const tenant = this.tenantForm.getRawValue();
    const connection = this.connectionForm.getRawValue();
    const payload: UpdateTenantPayload = {
      name: tenant.name,
      timezoneId: tenant.timezoneId,
      description: tenant.description ?? '',
      contactEmail: tenant.contactEmail ?? '',
      schemaServer: connection.schemaServer,
      schemaServerPort: `${connection.schemaServerPort}`,
      schemaUsername: connection.schemaUsername,
      schemaConnectionParameters: connection.schemaConnectionParameters ?? '',
      autoUpdate: connection.autoUpdate
    };
    if (connection.schemaPassword) {
      payload.schemaPassword = connection.schemaPassword;
    }
    this.tenantManagementService.updateTenant(this.tenantId, payload).subscribe({
      next: () => {
        this.router.navigate(['../'], { relativeTo: this.route });
      },
      error: () => this.submitting.set(false)
    });
  }
}
