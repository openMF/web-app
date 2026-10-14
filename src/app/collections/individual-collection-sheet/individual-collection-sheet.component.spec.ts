/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { of, Subject } from 'rxjs';
import { DataReloadService } from 'app/core/services/data-reload.service';
import { Dates } from 'app/core/utils/dates';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { CollectionsService } from '../collections.service';
import { IndividualCollectionSheetComponent } from './individual-collection-sheet.component';

describe('IndividualCollectionSheetComponent', () => {
  /** Shape of POST /collectionsheet?command=generateCollectionSheet: dues are split by component. */
  const collectionSheetResponse = {
    dueDate: '2026-10-13',
    paymentTypeOptions: [{ id: 1, name: 'Cash' }],
    clients: [
      {
        clientId: 2,
        clientName: 'Ada Lovelace',
        loans: [{ loanId: 3, accountId: '000000003', principalDue: 594.05, interestDue: 48.87, feeDue: 0 }],
        savings: [{ savingsId: 5, depositAccountType: 'Recurring Deposit', dueAmount: 25 }]
      }
    ]
  };

  let collectionsServiceStub: { retrieveCollectionSheetData: jest.Mock; executeSaveCollectionSheet: jest.Mock };
  let dialogStub: { open: jest.Mock };
  let cdrStub: { markForCheck: jest.Mock };

  /** The form dialog closes with `{ data: form }`. */
  function dialogClosingWith(value: any) {
    return { afterClosed: () => of({ data: { value } }) };
  }

  function createComponent(): IndividualCollectionSheetComponent {
    collectionsServiceStub = {
      retrieveCollectionSheetData: jest.fn(() => of(collectionSheetResponse)),
      executeSaveCollectionSheet: jest.fn(() => of({}))
    };
    dialogStub = { open: jest.fn() };
    cdrStub = { markForCheck: jest.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ officesData: [] }) } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: CollectionsService, useValue: collectionsServiceStub },
        { provide: OrganizationService, useValue: { getStaffs: jest.fn(() => of([])) } },
        { provide: Dates, useValue: { formatDate: jest.fn(() => '13 October 2026') } },
        { provide: MatDialog, useValue: dialogStub },
        {
          provide: SettingsService,
          useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy', businessDate: new Date(2026, 9, 13) }
        },
        {
          provide: DataReloadService,
          useValue: {
            getReloadObservable: jest.fn(() => new Subject<void>()),
            triggerReload: jest.fn(),
            cleanup: jest.fn()
          }
        },
        { provide: ChangeDetectorRef, useValue: cdrStub }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new IndividualCollectionSheetComponent());
    component.ngOnInit();
    component.collectionSheetForm.patchValue({ officeId: 1 });
    return component;
  }

  it('shows the collection sheet once the response arrives', () => {
    const component = createComponent();
    const response$ = new Subject<any>();
    collectionsServiceStub.retrieveCollectionSheetData.mockReturnValue(response$);
    cdrStub.markForCheck.mockClear();

    component.previewCollectionSheet();
    expect(cdrStub.markForCheck).not.toHaveBeenCalled();

    response$.next(collectionSheetResponse);

    expect(component.isCollapsed).toBe(true);
    expect(cdrStub.markForCheck).toHaveBeenCalled();
  });

  it('computes the total due of each loan from its principal and interest due', () => {
    const component = createComponent();

    component.previewCollectionSheet();

    expect(component.loansData[0].totalDue).toBe(642.92);
  });

  it('stores a loan payment as a repayment of the total due', () => {
    const component = createComponent();
    component.previewCollectionSheet();
    dialogStub.open.mockReturnValue(dialogClosingWith({ paymentTypeId: 1, accountNumber: 'A-1' }));

    component.showAndStorePaymentDetails('loans', component.loansData[0], 0);
    component.submit();

    const payload = collectionsServiceStub.executeSaveCollectionSheet.mock.calls[0][0] as any;
    expect(payload.bulkDisbursementTransactions.bulkRepaymentTransactions).toEqual([
      expect.objectContaining({ loanId: 3, transactionAmount: 642.92, paymentTypeId: 1, accountNumber: 'A-1' })
    ]);
    expect(payload.bulkDisbursementTransactions.bulkSavingsDueTransactions).toEqual([]);
  });

  it('rounds the loan payment to the nearest cent', () => {
    const component = createComponent();

    // 100.18 + 0.2 is 100.38000000000001 in floating point; rounding up would charge 100.39.
    expect(component.getLoanTotalDueAmount({ totalDue: 100.18, chargesDue: 0.2 })).toBe(100.38);
  });

  it('keeps the payment details of a savings payment', () => {
    const component = createComponent();
    component.previewCollectionSheet();
    dialogStub.open.mockReturnValue(dialogClosingWith({ paymentTypeId: 1, receiptNumber: 'R-9' }));

    component.showAndStorePaymentDetails('savings', component.savingsData[0], 0);
    component.submit();

    const payload = collectionsServiceStub.executeSaveCollectionSheet.mock.calls[0][0] as any;
    expect(payload.bulkDisbursementTransactions.bulkSavingsDueTransactions).toEqual([
      expect.objectContaining({ savingsId: 5, transactionAmount: 25, paymentTypeId: 1, receiptNumber: 'R-9' })
    ]);
  });

  describe('rendered', () => {
    it('shows the loans and their total due once the collection sheet arrives', async () => {
      await TestBed.configureTestingModule({
        imports: [
          IndividualCollectionSheetComponent,
          TranslateModule.forRoot()
        ],
        providers: [
          provideRouter([]),
          provideNoopAnimations(),
          provideNativeDateAdapter(),
          { provide: ActivatedRoute, useValue: { data: of({ officesData: [{ id: 1, name: 'Head Office' }] }) } },
          { provide: CollectionsService, useValue: { retrieveCollectionSheetData: () => of(collectionSheetResponse) } },
          { provide: OrganizationService, useValue: { getStaffs: () => of([]) } },
          { provide: Dates, useValue: { formatDate: () => '13 October 2026' } },
          {
            provide: SettingsService,
            useValue: { language: { code: 'en' }, dateFormat: 'dd MMMM yyyy', businessDate: new Date(2026, 9, 13) }
          }
        ]
      }).compileComponents();
      TestBed.inject(FaIconLibrary).addIcons(faSearch);

      const fixture = TestBed.createComponent(IndividualCollectionSheetComponent);
      fixture.detectChanges();
      fixture.componentInstance.collectionSheetForm.patchValue({ officeId: 1 });
      // Render the staff list first, so the next check only shows what the collection sheet response marked.
      fixture.detectChanges();

      fixture.componentInstance.previewCollectionSheet();
      fixture.detectChanges();

      const text = fixture.nativeElement.textContent as string;
      expect(text).toContain('000000003');
      expect(text).toContain('642.92');
    });
  });
});
