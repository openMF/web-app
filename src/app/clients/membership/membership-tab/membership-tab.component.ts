/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { ClientActionNotifierService } from '../../clients-view/client-actions/client-action-notifier.service';
import { TranslateService } from '@ngx-translate/core';
import {
  MemberNominee,
  MembershipApplication,
  MembershipTemplate,
  Nominee,
  nomineeRelationshipText
} from '../membership.models';
import { MembershipService } from '../membership.service';
import { MembershipDeadlineComponent } from '../membership-deadline/membership-deadline.component';
import {
  MembershipDecisionData,
  MembershipDecisionDialogComponent
} from '../membership-decision-dialog/membership-decision-dialog.component';
import {
  MembershipApplyData,
  MembershipApplyDialogComponent
} from '../membership-apply-dialog/membership-apply-dialog.component';
import { MembershipSharesComponent } from '../membership-shares/membership-shares.component';
import { MembershipNomineeDialogComponent } from '../membership-nominee-dialog/membership-nominee-dialog.component';

/**
 * A member's membership (fineract-dbug ADR 0023 and 0035): where the latest application stands, what is being bought,
 * the money taken, the decision and its reason or note, and the accounts the approval opened; then every earlier
 * application with its decision. A refused person can apply again from here. For a member with no application on
 * record (joined before applications were kept), the shares they hold. For anyone but an organisation, the nominee as
 * it is now and the ones before (ADR 0047), which staff with UPDATE_NOMINEE can give or change.
 */
@Component({
  selector: 'mifosx-membership-tab',
  templateUrl: './membership-tab.component.html',
  styleUrls: ['./membership-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    FaIconComponent,
    FormatNumberPipe,
    MembershipDeadlineComponent,
    MembershipSharesComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MembershipTabComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private notifier = inject(ClientActionNotifierService);
  private membershipService = inject(MembershipService);
  private destroyRef = inject(DestroyRef);
  private translate = inject(TranslateService);

  readonly application = signal<MembershipApplication | null>(null);
  /** Every application, newest first; the first is {@link application}. */
  readonly history = signal<MembershipApplication[]>([]);
  readonly earlier = computed(() => this.history().slice(1));
  readonly template = signal<MembershipTemplate | null>(null);
  readonly savingsAccount = signal<any>(null);
  readonly shareAccount = signal<any>(null);
  /** The member as Fineract shows them (status, activation date), for a member with no application on record */
  readonly client = signal<any>(null);
  /** The member's share accounts that are not closed or rejected */
  readonly shareAccounts = signal<any[]>([]);
  /** Kitta held across the member's active share accounts */
  readonly kittaHeld = computed(() =>
    this.shareAccounts()
      .filter((s) => s.status?.active)
      .reduce((sum, s) => sum + Number(s.totalApprovedShares ?? 0), 0)
  );

  /** The share position and leaving: for a user who may read memberships, once the person is not just an applicant */
  readonly showShares = computed(() => {
    const status = this.client()?.status?.value;
    return this.membershipService.canRead() && !!status && status !== 'Pending' && status !== 'Rejected';
  });

  /** The nominee and the ones before; null for an organisation, or until loaded */
  readonly nominee = signal<MemberNominee | null>(null);
  readonly canChangeNominee = computed(
    () => !!this.nominee()?.canChange && this.membershipService.can('UPDATE_NOMINEE')
  );

  /** "A different person must approve" is on, and this user entered the application. */
  readonly mustBeSomeoneElse = computed(() => {
    const app = this.application();
    return !!app && !this.membershipService.mayDecide(app, this.template()?.settings);
  });
  /** A refused person applies again: refused application, or refused in Fineract before applications existed. */
  readonly canApplyAgain = computed(
    () =>
      (this.application()?.status === 'REJECTED' ||
        (!this.application() &&
          this.client()?.status?.value === 'Rejected' &&
          !!this.template()?.settings.shareFirstEnabled)) &&
      this.membershipService.can('CREATE_MEMBERSHIP')
  );

  constructor() {
    this.route.parent.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { membershipApplication: MembershipApplication | null; clientViewData: any }) => {
        const app = data.membershipApplication ?? null;
        this.application.set(app);
        this.client.set(data.clientViewData ?? null);
        if (app) {
          this.membershipService.history(app.clientId).subscribe((all) => this.history.set(all));
        }
        const clientId = app?.clientId ?? data.clientViewData?.id;
        // an organisation names no nominee (legal form 2, Entity)
        const organisation = app?.organisation || data.clientViewData?.legalForm?.id === 2;
        this.nominee.set(null);
        if (clientId && !organisation && this.membershipService.canRead()) {
          this.membershipService.nominee(clientId).subscribe((n) => this.nominee.set(n));
        }
      });
    this.membershipService.templateOrNull().subscribe((template) => this.template.set(template));
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { clientAccountsData: any }) => {
      const app = this.application();
      const accounts = data.clientAccountsData ?? {};
      this.savingsAccount.set(
        (accounts.savingsAccounts ?? []).find((a: any) => a.id === app?.savingsAccountId) ?? null
      );
      this.shareAccount.set((accounts.shareAccounts ?? []).find((a: any) => a.id === app?.shareAccountId) ?? null);
      this.shareAccounts.set(
        (accounts.shareAccounts ?? []).filter((a: any) => !a.status?.closed && !a.status?.rejected)
      );
    });
  }

  decide(decision: 'approve' | 'reject'): void {
    const application = this.application();
    if (!application) {
      return;
    }
    this.dialog
      .open<MembershipDecisionDialogComponent, MembershipDecisionData>(MembershipDecisionDialogComponent, {
        data: { application, decision },
        width: '560px',
        maxWidth: 'calc(100vw - 32px)'
      })
      .afterClosed()
      .subscribe((decided?: MembershipApplication) => {
        if (!decided) {
          return;
        }
        this.notifier.notify(decision === 'approve' ? 'membership.messages.approved' : 'membership.messages.rejected');
        reloadMemberPage(this.router, decided.clientId);
      });
  }

  applyAgain(): void {
    this.openApply('again');
  }

  changeNominee(): void {
    const current = this.nominee();
    if (!current) {
      return;
    }
    this.dialog
      .open<MembershipNomineeDialogComponent, MemberNominee, MemberNominee>(MembershipNomineeDialogComponent, {
        data: current,
        width: '640px',
        maxWidth: 'calc(100vw - 32px)'
      })
      .afterClosed()
      .subscribe((saved) => {
        if (saved) {
          this.nominee.set(saved);
          this.notifier.notify('membership.messages.nomineeSaved');
        }
      });
  }

  nomineeRelationship(nominee: Nominee): string {
    return nomineeRelationshipText(nominee, this.translate);
  }

  private openApply(mode: 'again'): void {
    const application = this.application();
    const client = this.client();
    const template = this.template();
    if ((application || client) && template) {
      openApplyDialog(this.dialog, {
        template,
        clientId: application?.clientId ?? client.id,
        name: application?.name ?? client.displayName,
        mode,
        previous: application
      }).subscribe((taken) => {
        if (taken) {
          this.notifier.notify('membership.messages.applicationTaken');
          reloadMemberPage(this.router, taken.clientId);
        }
      });
    }
  }
}

/** Opens the dialog for applying again or entering an existing application; emits the application taken, if any. */
export function openApplyDialog(dialog: MatDialog, data: MembershipApplyData) {
  return dialog
    .open<MembershipApplyDialogComponent, MembershipApplyData, MembershipApplication>(MembershipApplyDialogComponent, {
      data,
      width: '760px',
      maxWidth: 'calc(100vw - 32px)'
    })
    .afterClosed();
}

/**
 * Shows the member page again with fresh data: status, header and accounts all change on a decision. The member page
 * resolves its data only when the member changes, so pass through the members list without changing the address.
 */
export function reloadMemberPage(router: Router, clientId: number): void {
  router.navigateByUrl('/members', { skipLocationChange: true }).then(() =>
    router.navigate([
      '/members',
      clientId,
      'membership'
    ])
  );
}
