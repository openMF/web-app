/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DocumentDialogComponent, DocumentDialogData } from '../document-dialog/document-dialog.component';
import {
  FileDocument,
  FileHistoryEntry,
  LoanFile,
  LoanFileService,
  SLOW_AFTER_DAYS,
  isReadOnlyStage
} from '../loan-file.service';

/** The longest note the backend takes. */
const NOTE_MAX = 2000;

/**
 * One loan's file (fineract-dbug #324): who and what the loan is, its security, the checklist of documents to
 * collect, the buttons that complete or return the file, the staff's notes and the history. Every call answers the
 * whole file again, so the screen simply shows whatever came last.
 */
@Component({
  selector: 'mifosx-loan-file',
  templateUrl: './loan-file.component.html',
  styleUrls: ['./loan-file.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatProgressBar
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanFileComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private files = inject(LoanFileService);
  private dialog = inject(MatDialog);
  private snackBar = inject(MatSnackBar);
  private translate = inject(TranslateService);
  private fb = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);

  readonly noteMax = NOTE_MAX;
  readonly slowAfter = SLOW_AFTER_DAYS;
  readonly file = signal<LoanFile | null>(null);
  readonly loading = signal(false);
  readonly failed = signal(false);
  /** A call is on its way: the buttons wait. */
  readonly busy = signal(false);
  readonly returning = signal(false);

  readonly reason = this.fb.control('', [
    Validators.required,
    Validators.maxLength(500)
  ]);
  readonly note = this.fb.control('', [
    Validators.required,
    Validators.maxLength(NOTE_MAX)
  ]);

  ngOnInit(): void {
    this.route.paramMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.load(params.get('loanId'));
    });
  }

  private load(loanId: string | null): void {
    this.loading.set(true);
    this.files
      .get(loanId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (file) => {
          this.file.set(file);
          this.failed.set(false);
          this.loading.set(false);
        },
        error: () => {
          this.file.set(null);
          this.failed.set(true);
          this.loading.set(false);
        }
      });
  }

  /** Once the loan is approved the file is only read. */
  get readOnly(): boolean {
    return isReadOnlyStage(this.file()?.stage);
  }

  /** Documents can be ticked and undone while the documents are collected, and while the file is appraised. */
  get editable(): boolean {
    return !this.readOnly;
  }

  get canComplete(): boolean {
    const f = this.file();
    return !!f && f.stage === 'DOCUMENTS' && f.missing.length === 0;
  }

  get canReturn(): boolean {
    return this.file()?.stage === 'APPRAISAL';
  }

  get isSlow(): boolean {
    return (this.file()?.daysInStage ?? 0) > SLOW_AFTER_DAYS;
  }

  /** The applying documents, in the policy's order, then the ones that no longer apply (greyed). */
  get documents(): FileDocument[] {
    const docs = this.file()?.documents ?? [];
    return [
      ...docs.filter((d) => d.applies),
      ...docs.filter((d) => !d.applies)
    ];
  }

  /** Fineract's steps and the file's, newest first. */
  get history(): FileHistoryEntry[] {
    const key = (h: FileHistoryEntry) => h.at ?? h.on ?? '';
    return [...(this.file()?.history ?? [])].sort((a, b) => key(b).localeCompare(key(a)));
  }

  /** The Nepali (or English) wording of a standard item; a cooperative's own item shows its label as it is. */
  docLabel(code: string, label: string): string {
    const key = `lending.documents.${code}`;
    const text = this.translate.instant(key);
    return text && text !== key ? text : label;
  }

  /** One history line in words: the action, the item it was about and what the person wrote. */
  historyText(h: FileHistoryEntry): string {
    const key = `lending.history.${h.action}`;
    const text = this.translate.instant(key);
    const action = text && text !== key ? text : h.action;
    const item = h.itemCode ? ` — ${this.docLabel(h.itemCode, this.labelOf(h.itemCode))}` : '';
    return `${action}${item}`;
  }

  private labelOf(code: string): string {
    return this.file()?.documents.find((d) => d.code === code)?.label ?? code;
  }

  date(value: string | null): string {
    return this.files.bsDate(value);
  }

  tick(doc: FileDocument, mode: 'DONE' | 'NOT_APPLICABLE'): void {
    const f = this.file();
    const data: DocumentDialogData = {
      loanId: f.loanId,
      clientId: f.clientId,
      code: doc.code,
      label: this.docLabel(doc.code, doc.label),
      mode,
      documentId: doc.documentId,
      note: doc.note
    };
    this.dialog
      .open<DocumentDialogComponent, DocumentDialogData, LoanFile>(DocumentDialogComponent, {
        data,
        width: '560px',
        maxWidth: '96vw',
        autoFocus: 'first-tabbable'
      })
      .afterClosed()
      .subscribe((file) => {
        if (file) {
          this.file.set(file);
        }
      });
  }

  undo(doc: FileDocument): void {
    this.run(this.files.undo(this.file().loanId, doc.code));
  }

  complete(): void {
    this.run(this.files.complete(this.file().loanId), (file) => {
      if (file.registerNumber) {
        this.snackBar.open(
          this.translate.instant('lending.file.completed', { number: file.registerNumber }),
          undefined,
          { duration: 8000 }
        );
      }
    });
  }

  startReturn(): void {
    this.reason.reset('');
    this.returning.set(true);
  }

  confirmReturn(): void {
    if (this.reason.invalid || !this.reason.value.trim()) {
      this.reason.markAsTouched();
      return;
    }
    this.run(this.files.reopen(this.file().loanId, this.reason.value.trim()), () => this.returning.set(false));
  }

  addNote(): void {
    if (this.note.invalid || !this.note.value.trim()) {
      this.note.markAsTouched();
      return;
    }
    this.run(this.files.addNote(this.file().loanId, this.note.value.trim()), () => this.note.reset(''));
  }

  /** Runs one call and shows the file it answers; a refusal shows the backend's message through the app's alert. */
  private run(call: ReturnType<LoanFileService['get']>, after?: (file: LoanFile) => void): void {
    if (this.busy()) {
      return;
    }
    this.busy.set(true);
    call.subscribe({
      next: (file) => {
        this.file.set(file);
        this.busy.set(false);
        after?.(file);
      },
      error: () => this.busy.set(false)
    });
  }
}
