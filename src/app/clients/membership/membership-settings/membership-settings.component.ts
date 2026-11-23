/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSlideToggle, MatSlideToggleChange } from '@angular/material/slide-toggle';
import { TranslateService } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { MembershipService } from '../membership.service';
import {
  MembersWithoutShares,
  ShareCeiling,
  MembershipTemplate,
  OrganisationCategory,
  PaymentTaken,
  organisationCategoryLabel
} from '../membership.models';

/**
 * Membership settings (fineract-dbug ADR 0023 and 0035): the share-first rule, the products, and the rules each
 * cooperative chooses (decision deadline, a different person to approve, when the money is taken, nominee at joining),
 * with the active members who hold no shares, to clear before the rule is switched on.
 */
@Component({
  selector: 'mifosx-membership-settings',
  templateUrl: './membership-settings.component.html',
  styleUrls: ['./membership-settings.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
    MatSlideToggle,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipSettingsComponent implements OnInit {
  private membershipService = inject(MembershipService);
  private authenticationService = inject(AuthenticationService);
  private formBuilder = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  readonly template = signal<MembershipTemplate | null>(null);
  readonly withoutShares = signal<MembersWithoutShares | null>(null);
  readonly saving = signal(false);
  /** The organisation types and whether each may be members (fineract-dbug #127) */
  readonly categories = signal<OrganisationCategory[]>([]);
  readonly categoriesState = signal<'loading' | 'failed' | 'loaded'>('loading');
  /** The type whose switch is being saved */
  readonly savingCategory = signal<number | null>(null);
  readonly canUpdate = [
    'ALL_FUNCTIONS',
    'UPDATE_MEMBERSHIPSETTINGS'
  ].some((p) => (this.authenticationService.getCredentials()?.permissions ?? []).includes(p));

  readonly form = this.formBuilder.group({
    shareFirstEnabled: [false],
    deadlineOn: [false],
    decisionDays: [
      35 as number | null,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(365)
      ]
    ],
    separateApprover: [false],
    paymentTaken: ['AT_APPROVAL' as PaymentTaken],
    nomineeRequired: [false],
    nomineeRelationshipFromList: [false],
    kymRequiredForApproval: [true],
    ceilingOn: [true],
    shareCeilingPercent: [
      20 as number | null,
      [
        Validators.required,
        Validators.min(1),
        Validators.max(100)
      ]
    ],
    exitOnlyWhenSettled: [true],
    savingsProductId: [null as number | null],
    shareProductId: [null as number | null]
  });

  /** The members above the ceiling, shown on request */
  readonly ceiling = signal<ShareCeiling | null>(null);
  readonly ceilingState = signal<'closed' | 'loading' | 'failed' | 'loaded'>('closed');

  private readonly chosenShareProductId = signal<number | null>(null);

  /** The chosen share product has no accounting: share money and fees will not reach the books. */
  readonly noAccounting = computed(() => {
    const product = this.template()?.shareProducts.find((p) => p.id === this.chosenShareProductId());
    return !!product && !product.hasAccounting;
  });

  ngOnInit(): void {
    this.form.controls.deadlineOn.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((on) => this.toggleDays(!!on));
    this.form.controls.ceilingOn.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.toggleCeiling());
    this.form.controls.shareProductId.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((id) => this.chosenShareProductId.set(id ?? null));
    this.load();
    this.loadCategories();
  }

  showCeiling(): void {
    this.ceilingState.set('loading');
    this.membershipService.shareCeiling().subscribe({
      next: (c) => {
        this.ceiling.set(c);
        this.ceilingState.set('loaded');
      },
      error: () => this.ceilingState.set('failed')
    });
  }

  loadCategories(): void {
    this.categoriesState.set('loading');
    this.membershipService.organisationCategories().subscribe({
      next: (list) => {
        this.categories.set(list);
        this.categoriesState.set('loaded');
      },
      error: () => this.categoriesState.set('failed')
    });
  }

  categoryLabel(category: OrganisationCategory): string {
    return organisationCategoryLabel(this.translate, category);
  }

  toggleCategory(category: OrganisationCategory, change: MatSlideToggleChange): void {
    this.savingCategory.set(category.codeValueId);
    this.membershipService.updateOrganisationCategory(category.codeValueId, change.checked).subscribe({
      next: (list) => {
        this.categories.set(list);
        this.savingCategory.set(null);
        this.snackBar.open(
          this.translate.instant('membership.messages.settingsSaved'),
          this.translate.instant('labels.buttons.Close'),
          { duration: 3000 }
        );
      },
      error: () => {
        change.source.checked = !change.checked;
        this.savingCategory.set(null);
      }
    });
  }

  save(): void {
    if (this.form.invalid || this.saving()) {
      return;
    }
    const turningOn = !!this.form.value.shareFirstEnabled && !this.template()?.settings.shareFirstEnabled;
    const count = this.withoutShares()?.count ?? 0;
    const warnings: string[] = [];
    if (turningOn && count > 0) {
      warnings.push(this.translate.instant('membership.switchOnWarning', { count }));
    }
    if (turningOn && this.noAccounting()) {
      warnings.push(this.translate.instant('membership.noAccountingWarning'));
    }
    if (warnings.length) {
      warnings.push(this.translate.instant('membership.switchOnAnyway'));
      this.dialog
        .open(ConfirmationDialogComponent, {
          data: {
            heading: this.translate.instant('membership.Switch the rule on'),
            dialogContext: warnings.join(' '),
            type: 'Mild'
          }
        })
        .afterClosed()
        .subscribe((response: any) => {
          if (response?.confirm) {
            this.store();
          }
        });
    } else {
      this.store();
    }
  }

  private store(): void {
    this.saving.set(true);
    const v = this.form.getRawValue();
    this.membershipService
      .updateSettings({
        shareFirstEnabled: !!v.shareFirstEnabled,
        decisionDays: v.deadlineOn ? Number(v.decisionDays) : null,
        separateApprover: !!v.separateApprover,
        paymentTaken: v.paymentTaken ?? 'AT_APPROVAL',
        nomineeRequired: !!v.nomineeRequired,
        nomineeRelationshipFromList: !!v.nomineeRelationshipFromList,
        kymRequiredForApproval: v.kymRequiredForApproval !== false,
        shareCeilingPercent: v.ceilingOn ? Number(v.shareCeilingPercent) : null,
        exitOnlyWhenSettled: v.exitOnlyWhenSettled !== false,
        savingsProductId: v.savingsProductId ?? undefined,
        shareProductId: v.shareProductId ?? undefined
      })
      .subscribe({
        next: () => {
          this.snackBar.open(
            this.translate.instant('membership.messages.settingsSaved'),
            this.translate.instant('labels.buttons.Close'),
            { duration: 3000 }
          );
          this.saving.set(false);
          this.load();
          if (this.ceilingState() !== 'closed') {
            this.showCeiling();
          }
        },
        error: () => this.saving.set(false)
      });
  }

  private load(): void {
    forkJoin([
      this.membershipService.template(),
      this.membershipService.membersWithoutShares()
    ]).subscribe(
      ([
        template,
        withoutShares
      ]) => {
        this.template.set(template);
        this.withoutShares.set(withoutShares);
        const s = template.settings;
        this.form.reset({
          shareFirstEnabled: s.shareFirstEnabled,
          deadlineOn: s.decisionDays != null,
          decisionDays: s.decisionDays ?? 35,
          separateApprover: !!s.separateApprover,
          paymentTaken: s.paymentTaken ?? 'AT_APPROVAL',
          nomineeRequired: !!s.nomineeRequired,
          nomineeRelationshipFromList: !!s.nomineeRelationshipFromList,
          kymRequiredForApproval: s.kymRequiredForApproval !== false,
          ceilingOn: s.shareCeilingPercent != null,
          shareCeilingPercent: s.shareCeilingPercent ?? 20,
          exitOnlyWhenSettled: s.exitOnlyWhenSettled !== false,
          savingsProductId: s.savingsProductId ?? null,
          shareProductId: s.shareProductId ?? null
        });
        if (this.canUpdate) {
          this.form.enable();
          this.toggleDays(s.decisionDays != null);
          this.toggleCeiling();
        } else {
          this.form.disable();
        }
      }
    );
  }

  /** The percentage only counts, and is only checked, while the check is on. */
  private toggleCeiling(): void {
    const percent = this.form.controls.shareCeilingPercent;
    if (this.form.value.ceilingOn && this.canUpdate) {
      percent.enable({ emitEvent: false });
    } else {
      percent.disable({ emitEvent: false });
    }
  }

  /** The number of days only counts, and is only checked, while the deadline is on. */
  private toggleDays(on: boolean): void {
    const days = this.form.controls.decisionDays;
    if (on && this.canUpdate) {
      days.enable({ emitEvent: false });
    } else {
      days.disable({ emitEvent: false });
    }
  }
}
