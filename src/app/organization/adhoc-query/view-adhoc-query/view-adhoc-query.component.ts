/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Adhoc Query Component.
 */
@Component({
  selector: 'mifosx-view-adhoc-query',
  templateUrl: './view-adhoc-query.component.html',
  styleUrls: ['./view-adhoc-query.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewAdhocQueryComponent {
  private organizationService = inject(OrganizationService);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);

  /** Adhoc query data. */
  adhocQueryData: any;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { adhocQuery: any }) => {
      this.adhocQueryData = data.adhocQuery;
    });
  }

  /**
   * Retrieves the report run frequency value from id
   * @returns {string} Report run frequency value.
   */
  get reportRunFrequency(): string {
    for (const reportRunFrequency of this.adhocQueryData.reportRunFrequencies) {
      if (reportRunFrequency.id === this.adhocQueryData.reportRunFrequency) {
        return reportRunFrequency.value;
      }
    }
  }

  /**
   * Deletes the adhoc query and redirects to adhoc queries.
   */
  deleteAdhocQuery() {
    const deleteAdhocQueryDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `adhoc query ${this.adhocQueryData.id}` }
    });
    deleteAdhocQueryDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService
          .deleteAdhocQuery(this.adhocQueryData.id)
          .pipe(take(1))
          .subscribe(() => {
            this.router.navigate(['/organization/adhoc-query']);
          });
      }
    });
  }
}
