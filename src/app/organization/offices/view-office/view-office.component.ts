/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, inject, DestroyRef, ChangeDetectorRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLinkActive, RouterLink, RouterOutlet } from '@angular/router';
import { MatTabNav, MatTabLink, MatTabNavPanel } from '@angular/material/tabs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { OfficeDetailsSummary } from './office-details-summary';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View Office Component
 */
@Component({
  selector: 'mifosx-view-office',
  templateUrl: './view-office.component.html',
  styleUrls: ['./view-office.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTabNav,
    MatTabLink,
    RouterLinkActive,
    MatTabNavPanel,
    RouterOutlet
  ],
  providers: [OfficeDetailsSummary],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewOfficeComponent {
  private changeDetectorRef = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  readonly summary = inject(OfficeDetailsSummary);
  officeData: any;

  /** Office datatables data */
  officeDatatables: any;

  get isHeadOffice(): boolean {
    return !!this.officeData?.id && !this.officeData.parentId && this.officeData.hierarchy === '.';
  }

  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { office: any; officeDatatables: any }) => {
        if (this.officeData?.id !== data.office?.id) {
          this.summary.reset();
        }
        this.officeData = data.office;
        this.officeDatatables = data.officeDatatables;
        this.changeDetectorRef.markForCheck();
      });
  }
}
