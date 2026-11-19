/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatTooltip } from '@angular/material/tooltip';
import { AdToBsPipe } from 'app/pipes/ad-to-bs.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NepaliDateInputComponent } from 'app/shared/nepali-date-input/nepali-date-input.component';
import { InputDialogComponent, InputDialogData } from 'app/compliance/input-dialog/input-dialog.component';
import { GovernanceRegisterService } from '../governance-register.service';
import { Committee, Term, BUILT_IN_COMMITTEE_CODES } from '../governance-register.models';
import { isoDate } from '../governance-register.utils';
import { CommitteeDialogComponent, CommitteeDialogData } from './committee-dialog/committee-dialog.component';
import { TermDialogComponent, TermDialogData } from './term-dialog/term-dialog.component';
import { EndTermDialogComponent, EndTermDialogData } from './end-term-dialog/end-term-dialog.component';
import { PositionsDialogComponent } from './positions-dialog/positions-dialog.component';

/**
 * The committees (board, accounts supervision, sub-committees, election committee, management), each shown as its
 * own card - who serves on it today, its warnings and its past members, all on this one page instead of a table of
 * rows to open one at a time (fineract-dbug #138; docs/governance-register.md).
 */
@Component({
  selector: 'mifosx-committees',
  templateUrl: './committees.component.html',
  styleUrls: ['./committees.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIcon,
    MatProgressBar,
    MatTooltip,
    AdToBsPipe,
    NepaliDateInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CommitteesComponent implements OnInit {
  private governance = inject(GovernanceRegisterService);
  private dialog = inject(MatDialog);

  readonly committees = signal<Committee[]>([]);
  readonly loading = signal(false);
  readonly includeInactive = signal(false);
  readonly asOf = new FormControl<Date | null>(null);
  readonly today = new Date();
  readonly builtInCodes = BUILT_IN_COMMITTEE_CODES;

  // ---- past members and their loading state, keyed by committee id

  readonly pastOpen = signal<Record<number, boolean>>({});
  readonly pastLoading = signal<Record<number, boolean>>({});
  readonly pastLoaded = signal<Record<number, boolean>>({});
  readonly pastMembers = signal<Record<number, Term[]>>({});

  ngOnInit(): void {
    this.load();
    this.asOf.valueChanges.subscribe(() => this.load());
  }

  toggleInactive(e: MatCheckboxChange): void {
    this.includeInactive.set(e.checked);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.governance.committees(isoDate(this.asOf.value) ?? undefined, this.includeInactive()).subscribe({
      next: (c) => {
        this.committees.set(c);
        this.loading.set(false);
      },
      error: () => this.loading.set(false)
    });
  }

  /** After a change to one committee: the list (every card's counts and status), and its past members if shown. */
  private refreshRow(id: number): void {
    this.load();
    if (this.pastLoaded()[id]) {
      this.loadPastMembers(id, true);
    }
  }

  managePositions(): void {
    this.dialog.open(PositionsDialogComponent, { width: '480px', maxWidth: '96vw', autoFocus: false });
  }

  addCommittee(): void {
    this.dialog
      .open<CommitteeDialogComponent, CommitteeDialogData, Committee>(CommitteeDialogComponent, {
        data: {},
        width: '560px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((created) => created && this.load());
  }

  editCommittee(c: Committee): void {
    this.dialog
      .open<CommitteeDialogComponent, CommitteeDialogData, Committee>(CommitteeDialogComponent, {
        data: { committee: c },
        width: '560px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((saved) => saved && this.refreshRow(c.id));
  }

  addPerson(c: Committee): void {
    this.dialog
      .open<TermDialogComponent, TermDialogData, Term>(TermDialogComponent, {
        data: { committee: c },
        width: '640px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((added) => added && this.refreshRow(c.id));
  }

  changePosition(c: Committee, t: Term): void {
    this.dialog
      .open<TermDialogComponent, TermDialogData, Term>(TermDialogComponent, {
        data: { committee: c, changePositionOf: t },
        width: '640px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((changed) => changed && this.refreshRow(c.id));
  }

  endTerm(c: Committee, t: Term): void {
    this.dialog
      .open<EndTermDialogComponent, EndTermDialogData, Term>(EndTermDialogComponent, {
        data: { term: t },
        width: '520px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((ended) => ended && this.refreshRow(c.id));
  }

  voidTerm(c: Committee, t: Term): void {
    this.dialog
      .open<InputDialogComponent, InputDialogData, { reason: string }>(InputDialogComponent, {
        data: {
          title: 'governanceRegister.committees.voidTermTitle',
          message: t.personName,
          fields: [
            { name: 'reason', label: 'governanceRegister.Reason', type: 'textarea', required: true, maxLength: 500 }
          ],
          confirm: 'governanceRegister.committees.MarkAsAMistake',
          danger: true
        },
        width: '520px',
        maxWidth: '96vw'
      })
      .afterClosed()
      .subscribe((r) => {
        if (r?.reason) {
          this.governance.voidTerm(t.id, r.reason).subscribe(() => this.refreshRow(c.id));
        }
      });
  }

  togglePast(id: number): void {
    const open = !this.pastOpen()[id];
    this.pastOpen.update((m) => ({ ...m, [id]: open }));
    if (!open || this.pastLoaded()[id]) {
      return;
    }
    this.loadPastMembers(id);
  }

  private loadPastMembers(id: number, force = false): void {
    if (!force && this.pastLoaded()[id]) {
      return;
    }
    this.pastLoading.update((m) => ({ ...m, [id]: true }));
    this.governance.terms(id).subscribe({
      next: (terms) => {
        this.pastMembers.update((m) => ({ ...m, [id]: terms.filter((t) => !t.current) }));
        this.pastLoaded.update((m) => ({ ...m, [id]: true }));
        this.pastLoading.update((m) => ({ ...m, [id]: false }));
      },
      error: () => this.pastLoading.update((m) => ({ ...m, [id]: false }))
    });
  }

  committeeLabel(c: Pick<Committee, 'code' | 'name'>): string {
    return this.builtInCodes.includes(c.code) ? `governanceRegister.committee.${c.code}` : c.name;
  }

  positionLabel(t: Term): string {
    return t.positionCode.startsWith('OWN_') ? t.positionName : `governanceRegister.position.${t.positionCode}`;
  }

  /** A two-letter avatar badge from a "First Last" member's name. */
  initials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) {
      return '';
    }
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
}
