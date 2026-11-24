/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectorRef } from '@angular/core';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateService } from '@ngx-translate/core';
import { of, Subject, throwError, Observable } from 'rxjs';
import { Dates } from 'app/core/utils/dates';
import { AccountTransfersService } from 'app/account-transfers/account-transfers.service';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { TransactionsTabComponent } from './transactions-tab.component';

describe('TransactionsTabComponent', () => {
  const businessDate = new Date(2026, 0, 10);

  const mockTransaction: any = {
    id: 1,
    date: '10 January 2026',
    transactionType: { withdrawal: true },
    amount: 100,
    currency: { code: 'USD', displaySymbol: '$' }
  };

  const mockTransferTransaction: any = {
    ...mockTransaction,
    transfer: { id: 'transfer-1' }
  };

  let savingsServiceStub: any;
  let accountTransfersServiceStub: any;
  let routerStub: any;
  let dialogStub: any;
  let routeStub: any;

  function createRouteStub(): any {
    const savingsAccountsRoute: any = {
      data: of({
        savingsAccountData: {
          transactions: [mockTransaction],
          status: { value: 'Active' },
          currency: { code: 'USD', displaySymbol: '$', decimalPlaces: 2 }
        }
      }),
      snapshot: { params: { clientId: '100', savingAccountId: '1' } }
    };
    const savingsAccountRoute: any = {
      parent: savingsAccountsRoute,
      snapshot: { params: { clientId: '100' } }
    };
    const route: any = {
      parent: savingsAccountRoute,
      data: of({})
    };
    return route;
  }

  function createComponent(overrides: any = {}): TransactionsTabComponent {
    savingsServiceStub = {
      executeSavingsAccountTransactionsCommand: jest.fn(() => of({}))
    };
    accountTransfersServiceStub = {
      undoAccountTransfer: jest.fn(() => of({}))
    };
    routerStub = { navigate: jest.fn().mockResolvedValue(true), navigateByUrl: jest.fn().mockResolvedValue(true) };
    routeStub = overrides.route || createRouteStub();

    const afterClosedSubject = new Subject<any>();
    dialogStub = {
      open: jest.fn(() => ({
        afterClosed: () => afterClosedSubject.asObservable()
      })),
      _afterClosedSubject: afterClosedSubject
    };

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: ChangeDetectorRef, useValue: { markForCheck: jest.fn() } },
        { provide: ActivatedRoute, useValue: routeStub },
        { provide: Router, useValue: routerStub },
        { provide: SavingsService, useValue: savingsServiceStub },
        { provide: AccountTransfersService, useValue: accountTransfersServiceStub },
        { provide: SettingsService, useValue: { businessDate, dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: Dates,
          useValue: {
            formatDate: (date: Date, _format: string) =>
              date instanceof Date ? `${date.getDate()} January ${date.getFullYear()}` : String(date),
            parseDate: (value: any) =>
              value instanceof Array ? new Date(value[0], value[1] - 1, value[2]) : new Date(value)
          }
        },
        { provide: TranslateService, useValue: { instant: (key: string) => key } },
        { provide: MatDialog, useValue: dialogStub }
      ]
    });

    const component = TestBed.runInInjectionContext(() => new TransactionsTabComponent());
    component.ngOnInit();
    return component;
  }

  function confirmDialog() {
    dialogStub._afterClosedSubject.next({ confirm: true });
    dialogStub._afterClosedSubject.complete();
  }

  describe('undoTransaction', () => {
    it('calls the API service with expected arguments', fakeAsync(() => {
      const component = createComponent();

      component.undoTransaction(mockTransaction);
      confirmDialog();
      tick();

      expect(dialogStub.open).toHaveBeenCalled();
      expect(savingsServiceStub.executeSavingsAccountTransactionsCommand).toHaveBeenCalledWith(
        '1',
        'undo',
        expect.objectContaining({
          transactionDate: expect.any(Date),
          transactionAmount: 0,
          locale: 'en',
          dateFormat: 'dd MMMM yyyy'
        }),
        1
      );
    }));

    it('sets isLoading to true while the request is pending', fakeAsync(() => {
      const component = createComponent();
      const inFlight = new Subject<any>();
      savingsServiceStub.executeSavingsAccountTransactionsCommand.mockReturnValue(inFlight.asObservable());

      component.undoTransaction(mockTransaction);
      confirmDialog();
      tick();

      expect(component.isLoading).toBe(true);
    }));

    it('navigates to reload the transactions on successful completion', fakeAsync(() => {
      const component = createComponent();

      component.undoTransaction(mockTransaction);
      confirmDialog();
      tick();

      expect(routerStub.navigateByUrl).toHaveBeenCalled();
      expect(routerStub.navigate).toHaveBeenCalled();
    }));

    it('resets isLoading after successful completion', fakeAsync(() => {
      const component = createComponent();

      component.undoTransaction(mockTransaction);
      confirmDialog();
      tick();

      expect(component.isLoading).toBe(false);
    }));

    it('resets isLoading after API failure', fakeAsync(() => {
      const component = createComponent();
      savingsServiceStub.executeSavingsAccountTransactionsCommand.mockReturnValue(
        throwError(() => new Error('API error'))
      );

      component.undoTransaction(mockTransaction);
      confirmDialog();
      tick();

      expect(component.isLoading).toBe(false);
    }));

    it('does not navigate after API failure', fakeAsync(() => {
      const component = createComponent();
      savingsServiceStub.executeSavingsAccountTransactionsCommand.mockReturnValue(
        throwError(() => new Error('API error'))
      );

      component.undoTransaction(mockTransaction);
      confirmDialog();
      tick();

      expect(routerStub.navigateByUrl).not.toHaveBeenCalled();
      expect(routerStub.navigate).not.toHaveBeenCalled();
    }));
  });

  describe('undoTransfer', () => {
    it('calls the correct API service with expected arguments', fakeAsync(() => {
      const component = createComponent();

      component.undoTransfer(mockTransferTransaction);
      confirmDialog();
      tick();

      expect(dialogStub.open).toHaveBeenCalled();
      expect(accountTransfersServiceStub.undoAccountTransfer).toHaveBeenCalledWith('transfer-1');
    }));

    it('sets isLoading to true while the request is pending', fakeAsync(() => {
      const component = createComponent();
      const inFlight = new Subject<any>();
      accountTransfersServiceStub.undoAccountTransfer.mockReturnValue(inFlight.asObservable());

      component.undoTransfer(mockTransferTransaction);
      confirmDialog();
      tick();

      expect(component.isLoading).toBe(true);
    }));

    it('navigates to reload the transactions on successful completion', fakeAsync(() => {
      const component = createComponent();

      component.undoTransfer(mockTransferTransaction);
      confirmDialog();
      tick();

      expect(routerStub.navigateByUrl).toHaveBeenCalled();
      expect(routerStub.navigate).toHaveBeenCalled();
    }));

    it('resets isLoading after successful completion', fakeAsync(() => {
      const component = createComponent();

      component.undoTransfer(mockTransferTransaction);
      confirmDialog();
      tick();

      expect(component.isLoading).toBe(false);
    }));

    it('resets isLoading after API failure', fakeAsync(() => {
      const component = createComponent();
      accountTransfersServiceStub.undoAccountTransfer.mockReturnValue(throwError(() => new Error('API error')));

      component.undoTransfer(mockTransferTransaction);
      confirmDialog();
      tick();

      expect(component.isLoading).toBe(false);
    }));

    it('does not navigate after API failure', fakeAsync(() => {
      const component = createComponent();
      accountTransfersServiceStub.undoAccountTransfer.mockReturnValue(throwError(() => new Error('API error')));

      component.undoTransfer(mockTransferTransaction);
      confirmDialog();
      tick();

      expect(routerStub.navigateByUrl).not.toHaveBeenCalled();
      expect(routerStub.navigate).not.toHaveBeenCalled();
    }));
  });
});
