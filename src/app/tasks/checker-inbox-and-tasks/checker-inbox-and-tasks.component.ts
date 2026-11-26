/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OutputRef,
  OutputRefSubscription,
  inject
} from '@angular/core';
import { _ as extract } from '@ngx-translate/core';
import { RouterLinkActive, RouterOutlet } from '@angular/router';
import { CheckerInboxCountService } from '../checker-inbox-count.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-checker-inbox-and-tasks',
  templateUrl: './checker-inbox-and-tasks.component.html',
  styleUrls: ['./checker-inbox-and-tasks.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLinkActive,
    RouterOutlet
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CheckerInboxAndTasksComponent {
  private changeDetectorRef = inject(ChangeDetectorRef);
  private countSubscription?: OutputRefSubscription;
  readonly loanApprovalDescription = extract('loanApproval.description');
  loanApprovalActive = false;
  loanApprovalCount: number | null = null;
  readonly clientApprovalDescription = extract('clientApproval.description');
  checkerCount = inject(CheckerInboxCountService);
  checkerInboxActive = false;
  navigationOpen = false;
  creditCount: number | null = null;
  massRejectionActive = false;
  massRejectionCount: number | null = null;
  clientApprovalCount: number | null = null;
  clientApprovalActive = false;
  readonly queueGroups = [
    {
      label: extract('credits.reviewGroup'),
      queues: [
        { path: 'checker-inbox', label: 'labels.inputs.Checker Inbox', permissions: [
            'ALL_FUNCTIONS_READ',
            'READ_MAKERCHECKER',
            'APPROVE_LOAN',
            'APPROVE_LOAN_CHECKER'
          ] },
        { path: 'requests', label: 'labels.inputs.Credit Applications', permissions: ['READ_LOAN'] },
        { path: 'pending-prospects', label: 'labels.inputs.Pending Prospects', permissions: ['READ_PROSPECT'] }
      ]
    },
    {
      label: extract('credits.approvalsGroup'),
      queues: [
        { path: 'client-approval', label: 'labels.inputs.Client Approval', permissions: ['READ_CLIENT'] },
        { path: 'loan-approval', label: 'labels.inputs.Loan Approval', permissions: ['READ_LOAN'] },
        { path: 'council-approval', label: 'labels.text.Council Approval', permissions: [
            'ALL_FUNCTIONS_READ',
            'READ_MAKERCHECKER',
            'APPROVE_LOAN',
            'APPROVE_LOAN_CHECKER'
          ] }
      ]
    },
    {
      label: extract('credits.operationsGroup'),
      queues: [
        { path: 'loan-disbursal', label: 'labels.inputs.Loan Disbursal', permissions: ['READ_LOAN'] },
        { path: 'reschedule-loan', label: 'labels.inputs.Reschedule Loan', permissions: ['RESCHEDULE_LOAN'] },
        { path: 'credit', label: 'labels.inputs.Credit', permissions: ['READ_LOAN'] },
        { path: 'mass-rejection', label: 'labels.heading.Mass Rejection', permissions: ['READ_LOAN'] }
      ]
    }
  ];

  onActivate(component: {
    checkerInboxWorkspace?: boolean;
    isMassRejection?: boolean;
    queueCountChange?: OutputRef<number | null>;
    clientApprovalCountChange?: OutputRef<number | null>;
    loanApprovalCountChange?: OutputRef<number | null>;
  }): void {
    this.countSubscription?.unsubscribe();
    this.massRejectionActive = !!component.isMassRejection;
    this.massRejectionCount = null;
    this.checkerInboxActive = !!component.checkerInboxWorkspace;
    this.clientApprovalActive = !!component.clientApprovalCountChange;
    this.loanApprovalActive = !!component.loanApprovalCountChange;
    this.loanApprovalCount = null;
    this.clientApprovalCount = null;
    this.creditCount = null;
    this.changeDetectorRef.markForCheck();
    this.countSubscription = (
      component.loanApprovalCountChange ??
      component.clientApprovalCountChange ??
      component.queueCountChange
    )?.subscribe((count) => {
      if (this.loanApprovalActive) this.loanApprovalCount = count;
      else if (this.clientApprovalActive) this.clientApprovalCount = count;
      else if (this.massRejectionActive) this.massRejectionCount = count;
      else this.creditCount = count;
      this.changeDetectorRef.markForCheck();
    });
  }

  onDeactivate(): void {
    this.countSubscription?.unsubscribe();
  }
}
