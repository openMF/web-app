/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed, ComponentFixture, DeferBlockBehavior, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Subject, of, throwError } from 'rxjs';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { LoansService } from 'app/loans/loans.service';
import { environment } from '../../../../environments/environment';
import { LoanDocumentsTabComponent } from './loan-documents-tab.component';
import { LOAN_DOCUMENT_SCHEMES } from './loan-document-checklist.config';
import { LoanDocumentUploadDialogComponent } from './loan-document-upload-dialog.component';
import { downloadBlob } from 'app/core/utils/file-download.utils';
jest.mock('app/core/utils/file-download.utils', () => ({ downloadBlob: jest.fn() }));
const records = [
  { id: 1, fileName: 'GUXE550527HSLZXR03-18-CONTRATO_CREDITO_FIRMADO.pdf' },
  { id: 2, name: 'Información fiscal', fileName: 'CONSTANCIA.pdf', description: 'México' }
];
describe('LoanDocumentsTabComponent', () => {
  let fixture: ComponentFixture<LoanDocumentsTabComponent>;
  let component: LoanDocumentsTabComponent;
  let params: BehaviorSubject<any>;
  let parentData: BehaviorSubject<any>;
  let data: BehaviorSubject<any>;
  let loans: any;
  let dialog: any;
  const originalRBAC = environment.productionModeEnableRBAC;
  beforeEach(async () => {
    const storage = new Map<string, string>();
    jest.mocked(localStorage.getItem).mockImplementation((key: string) => storage.get(key) || null);
    jest.mocked(localStorage.setItem).mockImplementation((key: string, value: string) => {
      storage.set(key, value);
    });
    HTMLElement.prototype.scrollIntoView = jest.fn();
    global.IntersectionObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as any;
    localStorage.clear();
    environment.productionModeEnableRBAC = true;
    params = new BehaviorSubject({ loanId: '42' });
    parentData = new BehaviorSubject({ loanDetailsData: { loanProductId: 7, status: { pendingApproval: true } } });
    data = new BehaviorSubject({ loanDocuments: records });
    loans = {
      getLoanDocuments: jest.fn(() => of(records)),
      deleteLoanDocument: jest.fn(() => of({})),
      downloadLoanDocument: jest.fn(() => of(new Blob(['x'])))
    };
    dialog = { open: jest.fn(() => ({ afterClosed: () => of(null) })) };
    await TestBed.configureTestingModule({
      deferBlockBehavior: DeferBlockBehavior.Manual,
      imports: [
        LoanDocumentsTabComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { parent: { params, data: parentData }, data } },
        { provide: LoansService, useValue: loans },
        { provide: MatDialog, useValue: dialog },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions: ['ALL_FUNCTIONS'] }) } },
        {
          provide: LOAN_DOCUMENT_SCHEMES,
          useValue: {
            7: {
              numbers: [
                18,
                19
              ],
              requirements: [
                { labelKey: 'Contract', category: 'contract' },
                { labelKey: 'Missing', number: 19 }
              ]
            }
          }
        }
      ]
    }).compileComponents();
    const translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { loanDocuments: { document: 'Document', categories: { contract: 'Contract' } } });
    translate.use('en');
    fixture = TestBed.createComponent(LoanDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => {
    fixture.destroy();
    environment.productionModeEnableRBAC = originalRBAC;
  });
  it('renders loan-only grid without changing the shared header', () => {
    expect(component.view).toBe('grid');
    expect(fixture.nativeElement.querySelectorAll('.document-card')).toHaveLength(2);
    expect(component.categories.reduce((n, c) => n + c.count, 0)).toBe(2);
    expect(loans.getLoanDocuments).not.toHaveBeenCalled();
  });
  it('switches to a Material table without fetching and persists both preferences', () => {
    component.setView('list');
    component.setSort('name');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('table[mat-table]')).toBeTruthy();
    expect(localStorage.getItem('mifosx.loan-documents.view')).toBe('list');
    expect(localStorage.getItem('mifosx.loan-documents.sort')).toBe('name');
    expect(loans.getLoanDocuments).not.toHaveBeenCalled();
  });
  it('restores saved view and sort', () => {
    component.setView('list');
    component.setSort('category');
    fixture.destroy();
    fixture = TestBed.createComponent(LoanDocumentsTabComponent);
    component = fixture.componentInstance;
    expect(component.view).toBe('list');
    expect(component.sort).toBe('category');
  });
  it('debounces combined accent-insensitive search and category filters', fakeAsync(() => {
    component.search.setValue('mexico');
    tick(201);
    expect(component.visibleDocuments.map((d) => d.id)).toEqual([2]);
    component.setCategory('contract');
    expect(component.visibleDocuments).toHaveLength(0);
  }));
  it('sorts real numbers before unnumbered files and disables unavailable upload date', () => {
    expect(component.visibleDocuments.map((d) => d.id)).toEqual([
      1,
      2
    ]);
    expect(component.sort).toBe('number');
    expect(fixture.nativeElement.textContent).not.toContain('2026');
  });
  it('downloads through the authenticated service preserving original filename', () => {
    component.download(component.documents[0]);
    expect(loans.downloadLoanDocument).toHaveBeenCalledWith('42', '1');
    expect(downloadBlob).toHaveBeenCalledWith(expect.any(Blob), records[0].fileName);
  });
  it('names confirmation and does not delete on cancel', () => {
    component.delete(component.documents[0]);
    expect(dialog.open.mock.calls[0][1].data.deleteContext).toBe('Contrato de crédito firmado');
    expect(loans.deleteLoanDocument).not.toHaveBeenCalled();
  });
  it('reloads confirmed state after successful deletion', () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ delete: true }) });
    loans.getLoanDocuments.mockReturnValue(of([records[1]]));
    component.delete(component.documents[0]);
    expect(loans.deleteLoanDocument).toHaveBeenCalledWith('42', 1);
    expect(loans.getLoanDocuments).toHaveBeenCalledWith('42');
    expect(component.documents.map((d) => d.id)).toEqual([2]);
    expect(component.completed).toBe(0);
  });
  it('keeps documents and checklist on delete failure', () => {
    dialog.open.mockReturnValue({ afterClosed: () => of({ delete: true }) });
    loans.deleteLoanDocument.mockReturnValue(throwError(() => new Error('denied')));
    component.delete(component.documents[0]);
    expect(component.documents).toHaveLength(2);
    expect(component.completed).toBe(1);
    expect(component.error).toBe('deleteFailed');
    expect(loans.getLoanDocuments).not.toHaveBeenCalled();
  });
  it('never fabricates a dossier for unconfigured products', () => {
    parentData.next({ loanDetailsData: { loanProductId: 99, status: { pendingApproval: true } } });
    fixture.detectChanges();
    expect(component.slots).toHaveLength(0);
    expect(fixture.nativeElement.querySelector('.dossier')).toBeNull();
    expect(fixture.nativeElement.querySelector('.checklist')).toBeNull();
  });
  it.each([
    false,
    undefined
  ])('hides checklist unless authoritative pendingApproval is true: %s', (pendingApproval) => {
    parentData.next({ loanDetailsData: { loanProductId: 7, status: { pendingApproval } } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.checklist')).toBeNull();
  });
  it('calculates dossier from unique slots and actual requirements', () => {
    expect(component.completed).toBe(1);
    expect(component.percentage).toBe(50);
    expect(component.requirements.map((r) => r.complete)).toEqual([
      true,
      false
    ]);
    expect(fixture.nativeElement.querySelector('.checklist')).toBeTruthy();
  });
  it('locates a filtered document by clearing filters; missing slots prefill the shared upload workflow', () => {
    component.setCategory('identity');
    component.locate(18);
    expect(component.category).toBe('');
    expect(component.highlightedId).toBe(1);
    component.locate(19);
    expect(dialog.open).toHaveBeenCalledWith(
      LoanDocumentUploadDialogComponent,
      expect.objectContaining({ data: expect.objectContaining({ expectedNumber: 19 }) })
    );
  });
  it('hides mutation actions and denies drag/drop upload for a read-only user', () => {
    jest
      .spyOn(TestBed.inject(AuthenticationService), 'getCredentials')
      .mockReturnValue({ permissions: ['READ_DOCUMENT'] } as any);
    fixture.destroy();
    fixture = TestBed.createComponent(LoanDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.upload();
    component.edit(component.documents[0]);
    component.delete(component.documents[0]);
    expect(dialog.open).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.upload-tile')).toBeNull();
  });
  it('retains confirmed state on refresh failure', () => {
    loans.getLoanDocuments.mockReturnValue(throwError(() => new Error('offline')));
    component.refresh();
    expect(component.documents).toHaveLength(2);
    expect(component.error).toBe('loadFailed');
  });
  it('cancels a pending search when a dossier slot is located', fakeAsync(() => {
    component.search.setValue('will hide the target');
    component.locate(18);
    tick(201);
    expect(component.query).toBe('');
    expect(component.visibleDocuments.some((doc) => doc.number === 18)).toBe(true);
    tick(2500);
  }));
  it('ignores a slower stale refresh after a newer confirmed read', () => {
    const older = new Subject<any>();
    const newer = new Subject<any>();
    loans.getLoanDocuments.mockReturnValueOnce(older).mockReturnValueOnce(newer);
    component.refresh();
    component.refresh();
    newer.next([records[1]]);
    newer.complete();
    older.next(records);
    older.complete();
    expect(component.documents.map((doc) => doc.id)).toEqual([2]);
    expect(component.loading).toBe(false);
  });
  it('cancels queued ZIP reads when the selected loan changes', () => {
    const attachment = new Subject<Blob>();
    loans.downloadLoanDocument.mockReturnValue(attachment);
    component.downloadAll();
    expect(component.zipBusy).toBe(true);
    expect(attachment.observed).toBe(true);
    params.next({ loanId: '43' });
    expect(component.zipBusy).toBe(false);
    expect(attachment.observed).toBe(false);
  });
  it.each([
    true,
    false
  ])(
    'orders the post-delete read after a competing refresh, even when that refresh finishes first: %s',
    (refreshFirst) => {
      const deletion = new Subject<any>();
      const competingRead = new Subject<any>();
      const postDeleteRead = new Subject<any>();
      dialog.open.mockReturnValue({ afterClosed: () => of({ delete: true }) });
      loans.deleteLoanDocument.mockReturnValue(deletion);
      loans.getLoanDocuments.mockReturnValueOnce(competingRead).mockReturnValueOnce(postDeleteRead);
      component.delete(component.documents[0]);
      component.refresh();
      if (refreshFirst) {
        competingRead.next(records);
        competingRead.complete();
      }
      deletion.next({});
      deletion.complete();
      postDeleteRead.next([records[1]]);
      postDeleteRead.complete();
      if (!refreshFirst) {
        competingRead.next(records);
        competingRead.complete();
      }
      expect(component.documents.map((doc) => doc.id)).toEqual([2]);
      expect(component.completed).toBe(0);
      expect(component.loading).toBe(false);
      expect(component.mutationBusy).toBe(false);
    }
  );
  it.each([
    'delete',
    'read'
  ])('scopes mutation busy state to the selected loan while its old %s is pending', (phase) => {
    const oldDelete = new Subject<any>();
    const oldRead = new Subject<any>();
    const newDelete = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => of({ delete: true }) });
    loans.deleteLoanDocument.mockImplementation((loanId: string) => (loanId === '42' ? oldDelete : newDelete));
    loans.getLoanDocuments.mockImplementation((loanId: string) => (loanId === '42' ? oldRead : of([])));
    component.delete(component.documents[0]);
    if (phase === 'read') {
      oldDelete.next({});
      oldDelete.complete();
      expect(oldRead.observed).toBe(true);
    }
    params.next({ loanId: '43' });
    data.next({ loanDocuments: [{ id: 9, name: 'New loan document', fileName: 'new.pdf' }] });
    expect(component.mutationBusy).toBe(false);
    expect(oldDelete.observed).toBe(false);
    expect(oldRead.observed).toBe(false);
    component.delete(component.documents[0]);
    expect(component.mutationBusy).toBe(true);
    oldDelete.next({});
    oldDelete.complete();
    oldRead.next(records);
    oldRead.complete();
    expect(component.mutationBusy).toBe(true);
    expect(component.documents[0].id).toBe(9);
    newDelete.next({});
    newDelete.complete();
    expect(component.mutationBusy).toBe(false);
    expect(component.documents).toEqual([]);
  });
  it('hides card badges and the number column for an unconfigured product while preserving filenames', () => {
    parentData.next({ loanDetailsData: { loanProductId: 99, status: { pendingApproval: true } } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.number-badge')).toBeNull();
    expect(component.documents[0].fileName).toBe(records[0].fileName);
    component.setView('list');
    fixture.detectChanges();
    expect(component.columns).not.toContain('number');
    expect(fixture.nativeElement.querySelector('.mat-column-number')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain(records[0].fileName);
  });
  it('keeps number badges and the number column for configured products', () => {
    expect(fixture.nativeElement.querySelector('.number-badge').textContent.trim()).toBe('18');
    component.setView('list');
    fixture.detectChanges();
    expect(component.columns[0]).toBe('number');
    expect(fixture.nativeElement.querySelector('.mat-column-number')).toBeTruthy();
  });
  it('renders pending refresh progress from an external callback under OnPush', async () => {
    fixture.autoDetectChanges();
    const response = new Subject<any>();
    loans.getLoanDocuments.mockReturnValue(response);
    component.refresh();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-progress-bar[mode="indeterminate"]')).toBeTruthy();
    response.next(records);
    response.complete();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-progress-bar[mode="indeterminate"]')).toBeNull();
  });
  it('renders pending deletion progress when a confirmation callback runs under OnPush', async () => {
    fixture.autoDetectChanges();
    const confirmation = new Subject<any>();
    const deletion = new Subject<any>();
    dialog.open.mockReturnValue({ afterClosed: () => confirmation });
    loans.deleteLoanDocument.mockReturnValue(deletion);
    component.delete(component.documents[0]);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-progress-bar[mode="indeterminate"]')).toBeNull();
    confirmation.next({ delete: true });
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-progress-bar[mode="indeterminate"]')).toBeTruthy();
    deletion.next({});
    deletion.complete();
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('mat-progress-bar[mode="indeterminate"]')).toBeNull();
  });
});
