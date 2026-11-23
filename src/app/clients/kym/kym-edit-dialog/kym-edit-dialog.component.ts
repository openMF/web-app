/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AfterViewInit, ChangeDetectionStrategy, Component, ElementRef, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatIcon } from '@angular/material/icon';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NepaliDateInputComponent } from 'app/shared/nepali-date-input/nepali-date-input.component';
import { CodeOption, KymService } from '../kym.service';
import {
  FAMILY_TYPES,
  INCOME_BANDS,
  INCOME_HEADINGS,
  KymOtherCoop,
  KymPerson,
  KymView,
  MARITAL_STATUSES
} from '../kym.models';
import { KymMemberPickerComponent } from '../member-picker/member-picker.component';
import { revealFirstInvalid } from '../reveal-first-invalid';
import { RelationshipSelectComponent } from 'app/shared/relationship-select/relationship-select.component';

export interface KymEditDialogData {
  clientId: number;
  kym: KymView;
  professions: CodeOption[];
  /** A missing item to scroll to */
  focus?: string;
}

/** Which section of the form each missing item is in, to scroll there. */
const SECTION: Record<string, string> = {
  maritalStatus: 'family',
  familyType: 'family',
  occupation: 'family',
  pan: 'family',
  guardian: 'family',
  pep: 'pep',
  pepDetails: 'pep',
  workingAreaResidence: 'living',
  timeInWorkingArea: 'living',
  purposeOfJoining: 'living',
  otherCoop: 'coops',
  otherCoopList: 'coops',
  otherCoopPurpose: 'coops',
  familyOtherCoop: 'coops',
  familyOtherCoopList: 'coops',
  familyOtherCoopPurpose: 'coops',
  familyHere: 'here',
  familyHereList: 'here',
  incomeBand: 'income',
  incomeSources: 'income',
  // The money questions sit under the "Income and transactions" heading, which stays in view above them.
  expectedTransactions: 'income',
  expectedDeposit: 'income',
  expectedBorrowing: 'income',
  someoneElseDirects: 'owner',
  recommenders: 'recommend',
  declaration: 'declare'
};

/** A form control by its name. */
const control = (name: string) => `[formcontrolname="${name}"]`;

/**
 * The field each missing item is filled in, to focus and highlight it once its section is in view. Where the field
 * only shows after an earlier answer (details after "yes"), the first one on the form is used: the question to
 * answer first.
 */
const TARGET: Record<string, string[]> = {
  maritalStatus: [control('maritalStatus')],
  familyType: [control('familyType')],
  occupation: [control('occupationId')],
  pan: [control('noPan')],
  guardian: [control('guardianName')],
  pep: [control('pepDeclared')],
  pepDetails: [
    control('pepName'),
    control('pepPost'),
    control('pepDeclared')
  ],
  workingAreaResidence: [control('workingAreaResidence')],
  timeInWorkingArea: [control('timeInWorkingArea')],
  purposeOfJoining: [control('purposeOfJoining')],
  otherCoop: [control('otherCoopMember')],
  otherCoopList: [
    `[formarrayname="otherCoops"] ${control('coopNameAddress')}`,
    control('otherCoopMember')
  ],
  otherCoopPurpose: [
    control('otherCoopPurpose'),
    control('otherCoopMember')
  ],
  familyOtherCoop: [control('familyOtherCoopMember')],
  familyOtherCoopList: [
    `[formarrayname="otherCoops"] ${control('coopNameAddress')}`,
    control('familyOtherCoopMember')
  ],
  familyOtherCoopPurpose: [
    control('familyOtherCoopPurpose'),
    control('familyOtherCoopMember')
  ],
  familyHere: [control('familyInThisCoop')],
  familyHereList: [
    '[data-kym-field="familyHereList"]',
    control('familyInThisCoop')
  ],
  incomeBand: [control('incomeBand')],
  incomeSources: [
    `[formarrayname="incomeSources"] ${control('heading')}`,
    control('incomeBand')
  ],
  expectedTransactions: [control('expectedTransactionsYear')],
  expectedDeposit: [control('expectedDepositYear')],
  expectedBorrowing: [control('expectedBorrowing')],
  someoneElseDirects: [control('someoneElseDirects')],
  recommenders: [
    '[data-kym-field="recommenders"]',
    control('foundingMember')
  ],
  declaration: [control('declarationAccepted')]
};

/** What can take focus inside a field's element. */
const FOCUSABLE = 'input, textarea, select, [tabindex]:not([tabindex="-1"])';

/** How long the field just scrolled to stays highlighted. */
const HIGHLIGHT_MS = 1500;

/**
 * The KYM form's own questions (what Fineract does not keep), changed with the member present. Only what changed is
 * sent; a change told more than the notice period after it happened is marked late by the server.
 */
@Component({
  selector: 'mifosx-kym-edit-dialog',
  templateUrl: './kym-edit-dialog.component.html',
  styleUrls: ['./kym-edit-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    MatRadioGroup,
    MatRadioButton,
    MatIcon,
    NepaliDateInputComponent,
    KymMemberPickerComponent,
    RelationshipSelectComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class KymEditDialogComponent implements AfterViewInit {
  readonly data = inject<KymEditDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<KymEditDialogComponent, KymView>);
  private fb = inject(FormBuilder);
  private kymService = inject(KymService);
  private host = inject(ElementRef<HTMLElement>);

  readonly maritalStatuses = MARITAL_STATUSES;
  readonly familyTypes = FAMILY_TYPES;
  readonly incomeBands = INCOME_BANDS;
  readonly incomeHeadings = INCOME_HEADINGS;
  readonly today = new Date();
  readonly busy = signal(false);
  readonly recommenders = signal<KymPerson[]>([]);

  readonly form: FormGroup;
  private readonly initial: Record<string, unknown>;

  constructor() {
    const v = this.data.kym.values;
    this.form = this.fb.group({
      maritalStatus: [v.maritalStatus],
      familyType: [v.familyType],
      occupationId: [v.occupationId],
      occupationDetail: [
        v.occupationDetail,
        Validators.maxLength(200)
      ],
      noPan: [v.noPan ?? false],
      pepDeclared: [v.pepDeclared],
      pepName: [
        v.pepName,
        Validators.maxLength(200)
      ],
      pepSelf: [v.pepSelf ?? false],
      pepRelationshipCode: [v.pepRelationshipCode ?? null],
      pepRelationshipDetail: [v.pepRelationshipDetail ?? null],
      pepPost: [
        v.pepPost,
        Validators.maxLength(200)
      ],
      guardianName: [
        v.guardianName,
        Validators.maxLength(200)
      ],
      workingAreaResidence: [v.workingAreaResidence],
      votingPollingPlace: [
        v.votingPollingPlace,
        Validators.maxLength(200)
      ],
      timeInWorkingArea: [
        v.timeInWorkingArea,
        Validators.maxLength(100)
      ],
      purposeOfJoining: [
        v.purposeOfJoining,
        Validators.maxLength(500)
      ],
      otherCoopMember: [v.otherCoopMember],
      otherCoopPurpose: [
        v.otherCoopPurpose,
        Validators.maxLength(500)
      ],
      familyOtherCoopMember: [v.familyOtherCoopMember],
      familyOtherCoopPurpose: [
        v.familyOtherCoopPurpose,
        Validators.maxLength(500)
      ],
      familyInThisCoop: [v.familyInThisCoop],
      incomeBand: [v.incomeBand],
      expectedTransactionsYear: [
        v.expectedTransactionsYear,
        [
          Validators.min(0),
          Validators.max(1000000)
        ]
      ],
      expectedDepositYear: [
        v.expectedDepositYear,
        Validators.min(0)
      ],
      expectedBorrowing: [
        v.expectedBorrowing,
        Validators.min(0)
      ],
      someoneElseDirects: [v.someoneElseDirects],
      foundingMember: [v.foundingMember ?? false],
      declarationAccepted: [v.declarationAccepted ?? false],
      remarks: [
        v.remarks,
        Validators.maxLength(1000)
      ],
      otherCoops: this.fb.array(v.otherCoops.map((c) => this.coopRow(c.whose, c))),
      familyHere: this.fb.array(v.familyHere.map((p) => this.familyRow(p))),
      incomeSources: this.fb.array(v.incomeSources.map((s) => this.incomeRow(s.heading, s.detail, s.amount))),
      inPerson: [
        false,
        Validators.requiredTrue
      ],
      changeHappenedOn: [
        new Date(),
        Validators.required
      ]
    });
    this.recommenders.set([...v.recommenders]);
    this.initial = this.snapshot();
  }

  ngAfterViewInit(): void {
    const item = this.data.focus;
    if (item && SECTION[item]) {
      // Once the dialog has opened and placed its own focus, so the item's field keeps the focus given here.
      this.ref.afterOpened().subscribe(() => this.goToItem(item));
    }
  }

  /**
   * "Fill in" from the KYM tab: brings the item's section heading to the top (with space above it, see the
   * scroll-margin on the headings), then makes sure the item's field is in view too, focuses it and highlights it
   * for a moment.
   */
  private goToItem(item: string): void {
    const root: HTMLElement = this.host.nativeElement;
    root.querySelector<HTMLElement>('#kym-' + SECTION[item])?.scrollIntoView?.({ block: 'start' });

    const field = (TARGET[item] ?? [])
      .map((selector) => root.querySelector<HTMLElement>(selector))
      .find((element) => !!element);
    if (!field) {
      return;
    }
    const box =
      field.closest<HTMLElement>('mat-form-field, mat-radio-group, mat-checkbox, mifosx-kym-member-picker') ?? field;

    // A field far below its heading (after a long list of income sources) is brought into view as well.
    const content = root.querySelector('mat-dialog-content');
    if (content && box.getBoundingClientRect().bottom > content.getBoundingClientRect().bottom) {
      box.scrollIntoView?.({ block: 'center' });
    }

    const focusable = field.matches(FOCUSABLE) ? field : field.querySelector<HTMLElement>(FOCUSABLE);
    focusable?.focus({ preventScroll: true });

    box.classList.add('kym-target');
    setTimeout(() => box.classList.remove('kym-target'), HIGHLIGHT_MS);
  }

  get otherCoops(): FormArray {
    return this.form.get('otherCoops') as FormArray;
  }

  get incomeSources(): FormArray {
    return this.form.get('incomeSources') as FormArray;
  }

  get familyHere(): FormArray {
    return this.form.get('familyHere') as FormArray;
  }

  /** The relationship controls of a row: the code and description, and the text typed before the list, kept as it is. */
  private relationshipControls(r: Partial<KymPerson>): Record<string, unknown[]> {
    return {
      relationshipCode: [r.relationshipCode ?? null],
      relationshipDetail: [r.relationshipDetail ?? null],
      // with a code, the server sends the label here; it is not typed text
      relationship: [r.relationshipCode ? null : (r.relationship ?? null)]
    };
  }

  coopRow(whose = 'OWN', c: Partial<KymOtherCoop> = {}): FormGroup {
    return this.fb.group({
      whose: [
        whose,
        Validators.required
      ],
      personName: [
        c.personName ?? null,
        Validators.maxLength(200)
      ],
      ...this.relationshipControls(c),
      coopNameAddress: [
        c.coopNameAddress ?? null,
        [
          Validators.required,
          Validators.maxLength(300)
        ]
      ],
      membershipNo: [
        c.membershipNo ?? null,
        Validators.maxLength(50)
      ]
    });
  }

  incomeRow(heading = 'FARMING', detail?: string, amount?: number): FormGroup {
    return this.fb.group({
      heading: [
        heading,
        Validators.required
      ],
      detail: [
        detail ?? null,
        Validators.maxLength(200)
      ],
      amount: [
        amount ?? null,
        [
          Validators.required,
          Validators.min(0)
        ]
      ]
    });
  }

  addRecommender(p: KymPerson): void {
    if (this.recommenders().length < 2 && !this.recommenders().some((r) => r.clientId === p.clientId)) {
      this.recommenders.update((l) => [
        ...l,
        p
      ]);
    }
  }

  familyRow(p: KymPerson): FormGroup {
    return this.fb.group({
      clientId: [p.clientId],
      name: [p.name],
      accountNo: [p.accountNo],
      ...this.relationshipControls(p)
    });
  }

  addFamilyHere(p: KymPerson): void {
    if (!this.familyHere.value.some((r: KymPerson) => r.clientId === p.clientId)) {
      this.familyHere.push(this.familyRow({ ...p, relationship: undefined }));
    }
  }

  remove(list: 'recommenders', i: number): void {
    this[list].update((l) => l.filter((_, j) => j !== i));
  }

  /** The values as the API takes them, for comparing and sending. */
  private snapshot(): Record<string, unknown> {
    const { inPerson, changeHappenedOn, familyHere, ...rest } = this.form.getRawValue();
    return {
      ...rest,
      recommenders: this.recommenders().map((r) => r.clientId),
      familyHere: familyHere.map((p: KymPerson) => ({
        clientId: p.clientId,
        relationshipCode: p.relationshipCode || null,
        relationshipDetail: p.relationshipDetail?.trim() || null,
        relationship: p.relationship || null
      }))
    };
  }

  changed(): Record<string, unknown> {
    const now = this.snapshot();
    const out: Record<string, unknown> = {};
    for (const [
      k,
      v
    ] of Object.entries(now)) {
      if (JSON.stringify(v ?? null) !== JSON.stringify(this.initial[k] ?? null)) {
        out[k] = v === '' ? null : v;
      }
    }
    return out;
  }

  /**
   * Saves what changed. Save is clickable once something has changed; if anything is still missing or invalid
   * (the "here in person" box at the bottom most often), nothing is sent: every field shows its error and the
   * first one is scrolled into view and focused.
   */
  save(): void {
    const changes = this.changed();
    if (!Object.keys(changes).length) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      revealFirstInvalid(this.host.nativeElement);
      return;
    }
    const d: Date = this.form.value.changeHappenedOn;
    const happened = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    this.busy.set(true);
    this.kymService.update(this.data.clientId, { ...changes, inPerson: true, changeHappenedOn: happened }).subscribe({
      next: (k) => this.ref.close(k),
      error: () => this.busy.set(false)
    });
  }
}
