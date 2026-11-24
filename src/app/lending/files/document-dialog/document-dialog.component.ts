/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AbstractControl, FormBuilder, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIcon } from '@angular/material/icon';
import { MatProgressBar } from '@angular/material/progress-bar';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ClientsService } from 'app/clients/clients.service';
import { LoansService } from 'app/loans/loans.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanFile, LoanFileService } from '../loan-file.service';

export interface DocumentDialogData {
  loanId: number;
  clientId: number;
  code: string;
  /** The document's name as shown in the checklist (already translated). */
  label: string;
  mode: 'DONE' | 'NOT_APPLICABLE';
  /** The Fineract document already attached, if the item is being ticked again. */
  documentId?: number | null;
  note?: string | null;
}

/** A Fineract document of the loan or of the member that a tick can point to. */
interface Scan {
  /** Unique in the list: a loan and a member can hold documents with the same id. */
  key: string;
  id: number;
  name: string;
  from: 'loan' | 'member';
}

/**
 * Tick a document of the loan file as done (optionally with a scan from Fineract's documents, or a new upload) or
 * as not applicable (with the reason). Closes with the file as the backend answers it.
 */
@Component({
  selector: 'mifosx-document-dialog',
  templateUrl: './document-dialog.component.html',
  styleUrls: ['./document-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogModule,
    MatIcon,
    MatProgressBar
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DocumentDialogComponent implements OnInit {
  readonly data = inject<DocumentDialogData>(MAT_DIALOG_DATA);
  private ref = inject(MatDialogRef<DocumentDialogComponent, LoanFile>);
  private fb = inject(FormBuilder);
  private files = inject(LoanFileService);
  private loans = inject(LoansService);
  private clients = inject(ClientsService);
  private destroyRef = inject(DestroyRef);

  readonly busy = signal(false);
  readonly uploading = signal(false);
  readonly scans = signal<Scan[]>([]);
  readonly isDone = this.data.mode === 'DONE';

  readonly form = this.fb.group({
    scan: [null as string | null],
    note: [
      this.data.note ?? '',
      this.isDone ? [Validators.maxLength(500)] : [
            Validators.required,
            Validators.maxLength(500),
            notBlank
          ]
    ]
  });

  ngOnInit(): void {
    this.loadScans(this.data.documentId ?? null);
  }

  private loadScans(select: number | null, from: 'loan' | 'member' = 'loan'): void {
    forkJoin({
      loan: this.loans.getLoanDocuments(this.data.loanId).pipe(catchError(() => of([]))),
      member: this.clients.getClientDocuments(String(this.data.clientId)).pipe(catchError(() => of([])))
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ loan, member }) => {
        const scans: Scan[] = [
          ...((loan as any[]) ?? []).map((d) => toScan(d, 'loan')),
          ...((member as any[]) ?? []).map((d) => toScan(d, 'member'))
        ];
        this.scans.set(scans);
        if (select != null) {
          // The document already ticked can be either's; a fresh upload is the loan's.
          const found = scans.find((s) => s.id === select && s.from === from) ?? scans.find((s) => s.id === select);
          this.form.controls.scan.setValue(found?.key ?? null);
        }
      });
  }

  /** Uploads the chosen file to the loan's documents (Fineract's own upload) and selects it. */
  upload(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) {
      return;
    }
    const body = new FormData();
    body.append('name', file.name.replace(/\.[^.]+$/, '').slice(0, 100) || file.name);
    body.append('description', this.data.label.slice(0, 500));
    body.append('file', file);
    this.uploading.set(true);
    this.loans.loadLoanDocument(this.data.loanId, body).subscribe({
      next: (res: { resourceId?: number }) => {
        this.uploading.set(false);
        this.loadScans(res?.resourceId ?? null, 'loan');
      },
      error: () => this.uploading.set(false)
    });
  }

  save(): void {
    if (this.busy()) {
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const { scan, note } = this.form.getRawValue();
    const picked = this.scans().find((s) => s.key === scan);
    const text = (note ?? '').trim();
    this.busy.set(true);
    // A refusal shows the backend's message through the app's error alert; the dialog stays open to fix it.
    this.files
      .tick(this.data.loanId, this.data.code, {
        status: this.data.mode,
        documentId: this.isDone ? (picked?.id ?? null) : null,
        note: text || null
      })
      .subscribe({
        next: (file) => this.ref.close(file),
        error: () => this.busy.set(false)
      });
  }
}

function toScan(d: { id: number; name?: string; fileName?: string }, from: 'loan' | 'member'): Scan {
  return { key: `${from}-${d.id}`, id: d.id, name: d.name || d.fileName || String(d.id), from };
}

/** Spaces alone are not a reason. */
function notBlank(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  return typeof value === 'string' && value.length && !value.trim() ? { required: true } : null;
}
