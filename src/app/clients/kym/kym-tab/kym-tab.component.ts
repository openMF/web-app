/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { TranslateService } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { relationshipText } from 'app/shared/relationship-select/relationship-select.component';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';
import { InputDialogComponent, InputDialogData } from 'app/compliance/input-dialog/input-dialog.component';
import { CodeOption, KymService } from '../kym.service';
import {
  FIX_TAB,
  KYM_DOCUMENTS,
  KymHistoryRow,
  KymMissing,
  KymPerson,
  KymValues,
  KymView,
  OrganisationPerson
} from '../kym.models';
import { KymEditDialogComponent, KymEditDialogData } from '../kym-edit-dialog/kym-edit-dialog.component';
import { KymOwnerDialogComponent } from '../kym-owner-dialog/kym-owner-dialog.component';
import { KymOrgDialogComponent, KymOrgDialogData } from '../kym-org-dialog/kym-org-dialog.component';
import { KymPersonDialogComponent, KymPersonDialogData } from '../kym-person-dialog/kym-person-dialog.component';
import {
  KymDocumentDialogComponent,
  KymDocumentDialogData
} from '../kym-document-dialog/kym-document-dialog.component';

/** The role a missing organisation item asks for. */
const ROLE_FOR: Record<string, string> = {
  boardMembers: 'BOARD_MEMBER',
  chiefExecutive: 'CHIEF_EXECUTIVE',
  accountOperators: 'ACCOUNT_OPERATOR'
};

/** Fixed on this tab rather than on another one. */
const HERE = [
  'owners',
  'people'
];

/**
 * A member's KYM (fineract-dbug #123, #124, #199; ADR 0039): its status, what is still missing (with the tab where each
 * thing is put right, because much of it is what Fineract already keeps), the form's own answers, the beneficial
 * owners (for an organisation: its own answers and its people, #191), and every change. Staff with UPDATE_KYM change it with the member present; a second person with VERIFY_KYM
 * verifies it.
 */
@Component({
  selector: 'mifosx-kym-tab',
  templateUrl: './kym-tab.component.html',
  styleUrls: ['./kym-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterLink,
    MatIcon,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KymTabComponent {
  private route = inject(ActivatedRoute);
  private kymService = inject(KymService);
  private dialog = inject(MatDialog);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  /** The member in the route: the tab is reused when going from one member's KYM to another's. */
  clientId = 0;
  readonly canRead = this.kymService.canRead();
  readonly canUpdate = this.kymService.canUpdate();
  readonly canVerify = this.kymService.canVerify();
  readonly canUpload = this.kymService.canUploadDocuments();

  readonly kym = signal<KymView | null>(null);
  readonly failed = signal(false);
  readonly busy = signal(false);
  readonly history = signal<KymHistoryRow[] | null>(null);
  /** How many of the latest changes show before Show all. */
  readonly recentChanges = 5;
  /** Whether every change shows (Show all) or only the latest few; kept when the history reloads after a save. */
  readonly historyExpanded = signal(false);
  readonly professions = signal<CodeOption[]>([]);

  /** The items fixed on other tabs, and those fixed on this tab's form, kept apart so each gets one clear action. */
  readonly elsewhere = computed(() =>
    (this.kym()?.missing ?? []).filter((m) => FIX_TAB[m.item] && !HERE.includes(FIX_TAB[m.item]))
  );
  readonly onForm = computed(() =>
    (this.kym()?.missing ?? []).filter((m) => !FIX_TAB[m.item] || HERE.includes(FIX_TAB[m.item]))
  );
  /** An organisation member (legal form Entity) has the organisation form instead of the personal one. */
  readonly isOrganisation = computed(() => !!this.kym()?.values.organisation);
  readonly occupation = computed(() => {
    const id = this.kym()?.values.occupationId;
    return id == null ? null : (this.professions().find((p) => p.id === id)?.name ?? null);
  });
  readonly currentOwners = computed(() => (this.kym()?.values.beneficialOwners ?? []).filter((o) => !o.endedAt));

  constructor() {
    if (this.canRead) {
      this.route.parent?.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        this.clientId = Number(params.get('clientId'));
        this.kym.set(null);
        this.history.set(null);
        this.historyExpanded.set(false);
        this.load();
      });
      this.kymService
        .professions()
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((p) => this.professions.set(p));
    }
  }

  load(): void {
    this.kymService
      .get(this.clientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (k) => {
          this.kym.set(k);
          this.failed.set(false);
          // The latest changes show without a click, and reload with the KYM.
          this.loadHistory();
        },
        error: () => this.failed.set(true)
      });
  }

  loadHistory(): void {
    this.kymService
      .history(this.clientId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((h) => this.history.set(h));
  }

  /** The changes to show, newest first (the server's order): all of them, or only the latest few. */
  shownChanges(history: KymHistoryRow[]): KymHistoryRow[] {
    return this.historyExpanded() ? history : history.slice(0, this.recentChanges);
  }

  /** Back to the latest few, and back up to the Changes heading the long list had scrolled away from. */
  showLessHistory(section: HTMLElement): void {
    this.historyExpanded.set(false);
    section.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
  }

  /** The translated words for a missing item, or the server's own words. */
  missingText(m: KymMissing): string {
    if (m.item === 'personKym') {
      return m.message; // names the person
    }
    const key = (this.isOrganisation() ? 'kym.org.missing.' : 'kym.missing.') + m.item;
    const t = this.translate.instant(key);
    return t && t !== key ? t : m.message;
  }

  /** Whether a value was given: the API leaves out or nulls what nobody answered. */
  has(v: unknown): boolean {
    return v !== null && v !== undefined;
  }

  yesNo(v: boolean | null | undefined): string {
    return !this.has(v) ? 'kym.Not answered' : v ? 'kym.Yes' : 'kym.No';
  }

  /** How a person named on the KYM is related, in the user's language; text typed before the list as it was typed. */
  relation(
    r: Pick<KymPerson, 'relationshipCode' | 'relationshipDetail' | 'relationshipLabelEn'> & {
      relationship?: string | null;
    }
  ): string {
    return relationshipText(
      this.translate,
      r.relationshipCode,
      r.relationshipDetail,
      r.relationship,
      r.relationshipLabelEn
    );
  }

  pepRelation(v: KymValues): string {
    return relationshipText(
      this.translate,
      v.pepRelationshipCode,
      v.pepRelationshipDetail,
      v.pepRelationship,
      v.pepRelationshipLabelEn
    );
  }

  /** A history row's field in words: the form's label when there is one, else the field's own name. */
  fieldName(field: string): string {
    // The occupation is recorded by its id; its label is the form's "Main occupation".
    const key = 'kym.field.' + (field === 'occupationId' ? 'occupation' : field);
    const t = this.translate.instant(key);
    return t && t !== key ? t : field;
  }

  /** A history value in words where it is one of the form's choices or a yes/no. */
  valueText(field: string, value: string | null): string {
    if (value === null || value === undefined) {
      return '—';
    }
    if (field === 'occupationId') {
      // The occupation's name from the list the tab loads; the id itself if it is no longer in the list.
      return this.professions().find((p) => String(p.id) === value)?.name ?? value;
    }
    const group: Record<string, string> = {
      maritalStatus: 'marital',
      familyType: 'familyType',
      incomeBand: 'band',
      workingAreaResidence: 'residence'
    };
    const key = group[field]
      ? `kym.${group[field]}.${value}`
      : value === 'true'
        ? 'kym.Yes'
        : value === 'false'
          ? 'kym.No'
          : null;
    if (!key) {
      return value;
    }
    const t = this.translate.instant(key);
    return t && t !== key ? t : value;
  }

  fixTab(m: KymMissing): string {
    return FIX_TAB[m.item];
  }

  /** A document the KYM looks for by name, which can be uploaded from here. */
  isDocument(m: KymMissing): boolean {
    return !!KYM_DOCUMENTS[m.item];
  }

  /** The action that puts a missing item right on this tab. */
  fill(m: KymMissing): void {
    if (m.item === 'beneficialOwner') {
      this.addOwner();
    } else if (ROLE_FOR[m.item]) {
      this.addPerson(ROLE_FOR[m.item]);
    } else if (m.item === 'personKym') {
      document.getElementById('kym-people')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (this.isOrganisation()) {
      this.editOrganisation();
    } else {
      this.edit(m.item);
    }
  }

  editOrganisation(): void {
    const k = this.kym();
    if (!k) {
      return;
    }
    this.dialog
      .open<KymOrgDialogComponent, KymOrgDialogData, KymView>(KymOrgDialogComponent, {
        data: { clientId: this.clientId, kym: k },
        width: '720px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((updated) => updated && this.updated(updated));
  }

  addPerson(role?: string): void {
    this.dialog
      .open<KymPersonDialogComponent, KymPersonDialogData, KymView>(KymPersonDialogComponent, {
        data: { clientId: this.clientId, role },
        width: '640px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((updated) => updated && this.updated(updated));
  }

  endPerson(p: OrganisationPerson): void {
    this.dialog
      .open<InputDialogComponent, InputDialogData, { reason: string }>(InputDialogComponent, {
        data: {
          title: this.translate.instant('kym.org.endTitle', {
            name: p.name,
            role: this.translate.instant('kym.org.role.' + p.role)
          }),
          fields: [{ name: 'reason', label: 'kym.Reason', type: 'textarea', required: true, maxLength: 500 }],
          confirm: 'kym.End'
        }
      })
      .afterClosed()
      .subscribe((r) => {
        if (r?.reason) {
          this.run(this.kymService.endPerson(this.clientId, p.id, r.reason));
        }
      });
  }

  upload(m: KymMissing): void {
    this.dialog
      .open<KymDocumentDialogComponent, KymDocumentDialogData, boolean>(KymDocumentDialogComponent, {
        data: { clientId: this.clientId, item: m.item, label: this.missingText(m) },
        width: '520px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((done) => done && this.load());
  }

  /** A dialog changed the KYM: show it, and the history if it is open. */
  private updated(k: KymView): void {
    this.kym.set(k);
    if (this.history()) {
      this.loadHistory();
    }
  }

  edit(focus?: string): void {
    const k = this.kym();
    if (!k) {
      return;
    }
    this.dialog
      .open<KymEditDialogComponent, KymEditDialogData, KymView>(KymEditDialogComponent, {
        data: { clientId: this.clientId, kym: k, professions: this.professions(), focus },
        width: '760px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((updated) => updated && this.kym.set(updated));
  }

  addOwner(): void {
    this.dialog
      .open(KymOwnerDialogComponent, {
        data: { clientId: this.clientId },
        width: '640px',
        maxWidth: '96vw',
        autoFocus: false
      })
      .afterClosed()
      .subscribe((updated: KymView | undefined) => updated && this.kym.set(updated));
  }

  endOwner(ownerId: number, name: string): void {
    this.dialog
      .open<InputDialogComponent, InputDialogData, { reason: string }>(InputDialogComponent, {
        data: {
          title: this.translate.instant('kym.endOwnerTitle', { name }),
          fields: [{ name: 'reason', label: 'kym.Reason', type: 'textarea', required: true, maxLength: 500 }],
          confirm: 'kym.End'
        }
      })
      .afterClosed()
      .subscribe((r) => {
        if (r?.reason) {
          this.run(this.kymService.endOwner(this.clientId, ownerId, r.reason));
        }
      });
  }

  verify(): void {
    this.run(this.kymService.verify(this.clientId));
  }

  simplified(): void {
    const k = this.kym();
    if (k?.level === 'SIMPLIFIED') {
      this.run(this.kymService.level(this.clientId, 'FULL'));
      return;
    }
    this.dialog
      .open<InputDialogComponent, InputDialogData, { reason: string }>(InputDialogComponent, {
        data: {
          title: 'kym.simplifiedTitle',
          message: 'kym.simplifiedLead',
          fields: [{ name: 'reason', label: 'kym.Reason', type: 'textarea', required: true, maxLength: 500 }],
          confirm: 'kym.Mark simplified'
        }
      })
      .afterClosed()
      .subscribe((r) => {
        if (r?.reason) {
          this.run(this.kymService.level(this.clientId, 'SIMPLIFIED', r.reason));
        }
      });
  }

  private run(call: ReturnType<KymService['verify']>): void {
    this.busy.set(true);
    call.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (k) => {
        this.kym.set(k);
        this.busy.set(false);
        if (this.history()) {
          this.loadHistory();
        }
      },
      error: () => this.busy.set(false)
    });
  }
}
