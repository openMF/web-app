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
  DestroyRef,
  ElementRef,
  Injector,
  ViewChild,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';
import { MatPrefix } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Subject, debounceTime, distinctUntilChanged, finalize, switchMap, takeUntil } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { LoansService } from 'app/loans/loans.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from '../../../../environments/environment';
import { downloadBlob } from 'app/core/utils/file-download.utils';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { DocumentPreviewService } from 'app/shared/services/document-preview.service';
import { LOAN_DOCUMENT_CATEGORIES } from './loan-document-categories.config';
import { LOAN_DOCUMENT_SCHEMES, LoanDocumentScheme } from './loan-document-checklist.config';
import {
  LoanDocument,
  PresentedLoanDocument,
  LoanDocumentSort,
  documentSize,
  dossierSlots,
  filterDocuments,
  presentDocument,
  requirementMet
} from './loan-document-presentation.utils';
import { LoanDocumentThumbnailComponent } from './loan-document-thumbnail.component';
import { LoanDocumentMediaService } from './loan-document-media.service';
import { LoanDocumentUploadDialogComponent } from './loan-document-upload-dialog.component';
import { LoanDocumentPreviewDialogComponent } from './loan-document-preview-dialog.component';
import { buildDocumentZip } from './loan-document-zip.utils';
const VIEW_KEY = 'mifosx.loan-documents.view';
const SORT_KEY = 'mifosx.loan-documents.sort';
@Component({
  selector: 'mifosx-loan-documents-tab',
  templateUrl: './loan-documents-tab.component.html',
  styleUrls: ['./loan-documents-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatButtonModule,
    MatPrefix,
    MatButtonToggleModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
    MatTooltipModule,
    MatProgressBarModule,
    LoanDocumentThumbnailComponent
  ],
  providers: [
    LoanDocumentMediaService,
    DocumentPreviewService
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class LoanDocumentsTabComponent {
  private route = inject(ActivatedRoute);
  private loans = inject(LoansService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);
  private injector = inject(Injector);
  private media = inject(LoanDocumentMediaService);
  private previews = inject(DocumentPreviewService);
  private auth = inject(AuthenticationService);
  private translate = inject(TranslateService);
  private schemes = inject(LOAN_DOCUMENT_SCHEMES);
  @ViewChild('workspace') workspace?: ElementRef<HTMLElement>;
  readonly search = new FormControl('', { nonNullable: true });
  readonly size = documentSize;
  private readonly documentColumns = [
    'name',
    'category',
    'filename',
    'size',
    'actions'
  ];
  entityId = '';
  documents: PresentedLoanDocument[] = [];
  visibleDocuments: PresentedLoanDocument[] = [];
  category = '';
  view: 'grid' | 'list' = 'grid';
  sort: LoanDocumentSort = 'number';
  query = '';
  loading = false;
  error = '';
  zipBusy = false;
  zipProgress = 0;
  mutationBusy = false;
  highlightedId?: number;
  scheme?: LoanDocumentScheme;
  pendingApproval = false;
  private revision = 0;
  private refreshSequence = 0;
  private readonly routeChanged = new Subject<void>();
  private highlightTimer?: ReturnType<typeof setTimeout>;
  constructor() {
    try {
      if (localStorage.getItem(VIEW_KEY) === 'list') this.view = 'list';
      const sort = localStorage.getItem(SORT_KEY);
      if ([
          'number',
          'name',
          'category'
        ].includes(sort)) this.sort = sort as LoanDocumentSort;
    } catch {
      /* Preferences are optional in restricted browsers. */
    }
    this.route.parent.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.entityId = params['loanId'];
      this.revision++;
      this.routeChanged.next();
      this.loading = false;
      this.mutationBusy = false;
      this.error = '';
      this.media.invalidate();
    });
    this.route.parent.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.scheme = this.schemes[data.loanDetailsData?.loanProductId];
      this.pendingApproval = data.loanDetailsData?.status?.pendingApproval === true;
      this.cdr.markForCheck();
    });
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data) => this.setDocuments(data.loanDocuments || []));
    this.search.valueChanges
      .pipe(debounceTime(200), distinctUntilChanged(), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.query = value;
        this.applyFilters();
      });
    this.destroyRef.onDestroy(() => {
      this.revision++;
      this.routeChanged.complete();
      clearTimeout(this.highlightTimer);
    });
  }
  get columns(): string[] {
    return this.scheme ? [
          'number',
          ...this.documentColumns
        ] : this.documentColumns;
  }
  get categories() {
    return LOAN_DOCUMENT_CATEGORIES.map((category) => ({
      ...category,
      count: this.documents.filter((doc) => doc.category === category.key).length
    })).filter((category) => category.count);
  }
  get slots() {
    return this.scheme ? dossierSlots(this.scheme, this.documents) : [];
  }
  get completed(): number {
    return this.slots.filter((slot) => slot.document).length;
  }
  get percentage(): number {
    return this.slots.length ? Math.round((this.completed / this.slots.length) * 100) : 0;
  }
  get requirements() {
    return this.scheme?.requirements.map((rule) => ({ ...rule, complete: requirementMet(rule, this.documents) })) || [];
  }
  can(permission: string): boolean {
    const permissions = this.auth.getCredentials()?.permissions || [];
    return (
      !environment.productionModeEnableRBAC ||
      permissions.includes('ALL_FUNCTIONS') ||
      permissions.includes(permission) ||
      (permission.startsWith('READ_') && permissions.includes('ALL_FUNCTIONS_READ'))
    );
  }
  title(doc: PresentedLoanDocument): string {
    return doc.title || this.translate.instant('loanDocuments.document');
  }
  setDocuments(documents: LoanDocument[]): void {
    this.documents = documents
      .filter((doc) => Number.isSafeInteger(Number(doc.id)) && Number(doc.id) > 0)
      .map((doc) => presentDocument({ ...doc, id: Number(doc.id) }));
    this.applyFilters();
  }
  applyFilters(): void {
    this.visibleDocuments = filterDocuments(this.documents, this.query, this.category, this.sort);
    this.cdr.markForCheck();
  }
  setCategory(category: string): void {
    this.category = category;
    this.applyFilters();
  }
  setView(view: 'grid' | 'list'): void {
    this.view = view;
    this.persist(VIEW_KEY, view);
  }
  setSort(sort: LoanDocumentSort): void {
    this.sort = sort;
    this.persist(SORT_KEY, sort);
    this.applyFilters();
  }
  private persist(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch {
      /* Optional preference. */
    }
  }
  refresh(): void {
    const revision = this.revision;
    const sequence = ++this.refreshSequence;
    this.loading = true;
    this.error = '';
    this.cdr.markForCheck();
    this.loans
      .getLoanDocuments(this.entityId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.routeChanged),
        finalize(() => {
          if (revision === this.revision && sequence === this.refreshSequence) {
            this.loading = false;
            this.cdr.markForCheck();
          }
        })
      )
      .subscribe({
        next: (documents) => {
          if (revision === this.revision && sequence === this.refreshSequence) {
            this.media.invalidate();
            this.setDocuments(documents);
          }
        },
        error: () => {
          if (revision === this.revision && sequence === this.refreshSequence) this.error = 'loadFailed';
        }
      });
  }
  upload(expectedNumber?: number, files?: File[]): void {
    if (!this.can('CREATE_DOCUMENT')) return;
    const revision = this.revision;
    this.dialog.open(LoanDocumentUploadDialogComponent, {
      width: '48rem',
      maxWidth: '96vw',
      data: {
        loanId: this.entityId,
        expectedNumber,
        files,
        onBatchComplete: () => {
          if (revision === this.revision) this.refresh();
        }
      }
    });
  }
  drop(event: DragEvent): void {
    event.preventDefault();
    if (event.dataTransfer?.files.length) this.upload(undefined, Array.from(event.dataTransfer.files));
  }
  edit(doc: PresentedLoanDocument): void {
    if (!this.can('UPDATE_DOCUMENT')) return;
    const revision = this.revision;
    this.dialog.open(LoanDocumentUploadDialogComponent, {
      width: '40rem',
      maxWidth: '96vw',
      data: {
        loanId: this.entityId,
        document: doc,
        onBatchComplete: () => {
          if (revision === this.revision) this.refresh();
        }
      }
    });
  }
  previewable(doc: PresentedLoanDocument): boolean {
    return this.previews.isPreviewable({ id: String(doc.id), fileName: doc.fileName, mimeType: doc.type });
  }
  preview(doc: PresentedLoanDocument): void {
    if (this.can('READ_DOCUMENT') && this.previewable(doc))
      this.dialog.open(LoanDocumentPreviewDialogComponent, {
        width: '64rem',
        maxWidth: '96vw',
        injector: this.injector,
        data: { loanId: this.entityId, document: doc }
      });
  }
  download(doc: PresentedLoanDocument): void {
    if (!this.can('READ_DOCUMENT')) return;
    this.error = '';
    this.loans
      .downloadLoanDocument(this.entityId, String(doc.id))
      .pipe(takeUntilDestroyed(this.destroyRef), takeUntil(this.routeChanged))
      .subscribe({
        next: (blob) => downloadBlob(blob, doc.fileName || `document-${doc.id}`),
        error: () => {
          this.error = 'downloadFailed';
          this.cdr.markForCheck();
        }
      });
  }
  downloadAll(): void {
    if (!this.can('READ_DOCUMENT') || this.zipBusy || !this.visibleDocuments.length) return;
    this.error = '';
    this.zipBusy = true;
    this.zipProgress = 0;
    const loanId = this.entityId;
    buildDocumentZip(
      [...this.visibleDocuments],
      (doc) => this.loans.downloadLoanDocument(loanId, String(doc.id)),
      (done, total) => {
        this.zipProgress = Math.round((done / total) * 100);
        this.cdr.markForCheck();
      }
    )
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        takeUntil(this.routeChanged),
        finalize(() => {
          this.zipBusy = false;
          this.cdr.markForCheck();
        })
      )
      .subscribe({
        next: (blob) => downloadBlob(blob, 'loan-documents.zip'),
        error: (error) => {
          this.error = error.message === 'zipLimit' ? 'zipLimit' : 'zipFailed';
        }
      });
  }
  delete(doc: PresentedLoanDocument): void {
    if (!this.can('DELETE_DOCUMENT') || this.mutationBusy) return;
    const loanId = this.entityId;
    const revision = this.revision;
    this.dialog
      .open(DeleteDialogComponent, { data: { deleteContext: this.title(doc) } })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((response) => {
        if (!response?.delete || revision !== this.revision) return;
        let sequence: number | undefined;
        this.mutationBusy = true;
        this.error = '';
        this.cdr.markForCheck();
        this.loans
          .deleteLoanDocument(loanId, doc.id)
          .pipe(
            switchMap(() => {
              sequence = ++this.refreshSequence;
              this.loading = false;
              this.error = '';
              return this.loans.getLoanDocuments(loanId);
            }),
            takeUntilDestroyed(this.destroyRef),
            takeUntil(this.routeChanged),
            finalize(() => {
              if (revision === this.revision) {
                this.mutationBusy = false;
                this.cdr.markForCheck();
              }
            })
          )
          .subscribe({
            next: (documents) => {
              if (revision === this.revision && sequence === this.refreshSequence) {
                this.media.invalidate();
                this.setDocuments(documents);
              }
            },
            error: () => {
              if (revision === this.revision && (sequence === undefined || sequence === this.refreshSequence))
                this.error = 'deleteFailed';
            }
          });
      });
  }
  locate(number: number): void {
    const doc = this.documents.find((item) => item.number === number);
    if (!doc) {
      this.upload(number);
      return;
    }
    this.query = '';
    this.search.setValue('');
    this.category = '';
    this.applyFilters();
    this.highlightedId = doc.id;
    this.cdr.detectChanges();
    const target = this.workspace?.nativeElement.querySelector<HTMLElement>(`[data-document-id="${doc.id}"]`);
    target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target?.focus({ preventScroll: true });
    clearTimeout(this.highlightTimer);
    this.highlightTimer = setTimeout(() => {
      this.highlightedId = undefined;
      this.cdr.markForCheck();
    }, 2500);
  }
}
