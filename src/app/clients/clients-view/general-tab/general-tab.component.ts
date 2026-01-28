/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

/** Custom Services. */
import { ClientsService } from 'app/clients/clients.service';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { NgClass } from '@angular/common';
import { AccountNumberComponent } from '../../../shared/account-number/account-number.component';
import { LongTextComponent } from '../../../shared/long-text/long-text.component';
import { MatTooltip } from '@angular/material/tooltip';
import { StatusLookupPipe } from '../../../pipes/status-lookup.pipe';
import { AccountsFilterPipe } from '../../../pipes/accounts-filter.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { CurrencyPipe } from '@angular/common';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { ReportsService } from 'app/reports/reports.service';
import { SettingsService } from 'app/settings/settings.service';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { AlertService } from 'app/core/alert/alert.service';
import { EMPTY } from 'rxjs';

/**
 * General Tab component.
 */
@Component({
  selector: 'mifosx-general-tab',
  templateUrl: './general-tab.component.html',
  styleUrls: ['./general-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgClass,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    AccountNumberComponent,
    LongTextComponent,
    MatTooltip,
    StatusLookupPipe,
    AccountsFilterPipe,
    DateFormatPipe,
    FormatNumberPipe,
    CurrencyPipe
  ]
})
export class GeneralTabComponent implements OnDestroy {
  private destroy$ = new Subject<void>();
  private alertService = inject(AlertService);
  private sanitizer = inject(DomSanitizer);
  pdfUrl: SafeResourceUrl | null = null;
  rawPdfUrl: string | null = null;
  showPdf: boolean = false;

  openLoanApplicationReport(event: MouseEvent, loanId: string) {
    event.stopPropagation();
    const tenantIdentifier = this.settingsService.tenantIdentifier || 'default';
    let locale = this.settingsService.languageCode || 'en-US';
    locale = locale.split('-')[0];
    const dateFormat = this.settingsService.dateFormat || 'dd MMMM yyyy';
    const formData = { R_loanId: loanId, 'output-type': 'PDF' };
    this.reportsService
      .getPentahoRunReportData('LoanApplicationReport', formData, tenantIdentifier, locale, dateFormat)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error): any => {
          this.showPdf = false;
          if (this.rawPdfUrl) {
            URL.revokeObjectURL(this.rawPdfUrl);
            this.rawPdfUrl = null;
          }
          this.pdfUrl = null;
          this.alertService.alert({
            type: 'error',
            message: 'Failed to load Loan Application PDF report.'
          });
          return EMPTY;
        })
      )
      .subscribe((res: any) => {
        if (this.rawPdfUrl) {
          URL.revokeObjectURL(this.rawPdfUrl);
          this.rawPdfUrl = null;
          this.pdfUrl = null;
        }
        const contentType = res.headers.get('Content-Type') || 'application/pdf';
        const file = new Blob([res.body], { type: contentType });
        this.rawPdfUrl = URL.createObjectURL(file);
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(this.rawPdfUrl);
        this.showPdf = true;
      });
  }

  closePdf() {
    this.showPdf = false;
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
    this.pdfUrl = null;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.rawPdfUrl) {
      URL.revokeObjectURL(this.rawPdfUrl);
      this.rawPdfUrl = null;
    }
    this.pdfUrl = null;
  }

  private route = inject(ActivatedRoute);
  private clientService = inject(ClientsService);
  private router = inject(Router);
  private reportsService = inject(ReportsService);
  private settingsService = inject(SettingsService);

  /** Open Loan Accounts Columns */
  openLoansColumns: string[] = [
    'Account No',
    'Loan Account',
    'Original Loan',
    'Loan Balance',
    'Amount Paid',
    'Type',
    'Actions'
  ];
  /** Closed Loan Accounts Columns */
  closedLoansColumns: string[] = [
    'Account No',
    'Loan Account',
    'Original Loan',
    'Loan Balance',
    'Amount Paid',
    'Type',
    'Closed Date',
    'Actions'
  ];
  /** Open Savings Accounts Columns */
  openSavingsColumns: string[] = [
    'Account No',
    'Saving Account',
    'Last Active',
    'Balance',
    'Actions'
  ];
  /** Closed Savings Accounts Columns */
  closedSavingsColumns: string[] = [
    'Account No',
    'Saving Account',
    'Closed Date'
  ];
  /** Open Shares Accounts Columns */
  openSharesColumns: string[] = [
    'Account No',
    'Share Account',
    'Approved Shares',
    'Pending For Approval Shares',
    'Actions'
  ];
  /** Closed Shares Accounts Columns */
  closedSharesColumns: string[] = [
    'Account No',
    'Share Account',
    'Approved Shares',
    'Pending For Approval Shares',
    'Closed Date'
  ];
  /** Upcoming Charges Columns */
  upcomingChargesColumns: string[] = [
    'Name',
    'Due as of',
    'Due',
    'Paid',
    'Waived',
    'Outstanding',
    'Actions'
  ];
  /** Collaterals Column */
  collateralsColumns: string[] = [
    'ID',
    'Name',
    'Quantity',
    'Total Value',
    'Total Collateral Value'
  ];

  /** Client Account Data */
  clientAccountData: any;
  /** Loan Accounts Data */
  loanAccounts: any;
  /** Savings Accounts Data */
  savingAccounts: any;
  /** Shares Accounts Data */
  shareAccounts: any;
  /** Upcoming Charges Data */
  upcomingCharges: any;
  /** Performance History Data */
  performanceHistory: {
    loanCycle: number;
    activeLoans: number;
    lastLoanAmount: number;
    activeSavings: number;
    totalSavings: number;
  } = {
    loanCycle: 0,
    activeLoans: 0,
    lastLoanAmount: 0,
    activeSavings: 0,
    totalSavings: 0
  };
  /** Collaterals Data */
  collaterals: any;

  /** Show Closed Loan Accounts */
  showClosedLoanAccounts = false;
  /** Show Closed Saving Accounts */
  showClosedSavingAccounts = false;
  /** Show Closed Share Accounts */
  showClosedShareAccounts = false;
  /** Show Closed Reccuring Deposits Accounts */
  showClosedRecurringAccounts = false;
  /** Show Closed Fixed Deposits Accounts */
  showClosedFixedAccounts = false;

  /** Client Id */
  clientid: any;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {ClientsService} clientService Clients Service
   * @param {Router} router Router
   */
  constructor() {
    this.route.data.subscribe(
      (data: { clientAccountsData: any; clientChargesData: any; clientSummary: any; clientCollateralData: any }) => {
        this.clientAccountData = data.clientAccountsData;
        this.savingAccounts = data.clientAccountsData.savingsAccounts;
        this.loanAccounts = data.clientAccountsData.loanAccounts;
        this.shareAccounts = data.clientAccountsData.shareAccounts;
        this.upcomingCharges = data.clientChargesData.pageItems;
        this.collaterals = data.clientCollateralData;
        this.clientid = this.route.parent.snapshot.params['clientId'];

        // Compute performance history from accounts data
        this.computePerformanceHistory(data.clientAccountsData);
      }
    );
  }

  private computePerformanceHistory(accountsData: any) {
    // Loan Cycles: total number of loans
    const allLoans = accountsData.loanAccounts || [];
    this.performanceHistory.loanCycle = allLoans.length;
    // Active Loans: status === 'Active'
    this.performanceHistory.activeLoans = allLoans.filter((l: any) => {
      if (!l.status) return false;
      if (typeof l.status === 'string') {
        return l.status.toLowerCase() === 'active';
      }
      if (typeof l.status === 'object' && l.status.value) {
        return l.status.value.toLowerCase() === 'active';
      }
      return false;
    }).length;
    // Loan Amount: most recent loan by submittedOnDate
    if (allLoans.length > 0) {
      const sortedLoans = [...allLoans].sort(
        (a, b) => new Date(b.submittedOnDate).getTime() - new Date(a.submittedOnDate).getTime()
      );
      this.performanceHistory.lastLoanAmount = sortedLoans[0].principal || 0;
    } else {
      this.performanceHistory.lastLoanAmount = 0;
    }
    // Active Savings: status === 'Active'
    const allSavings = accountsData.savingsAccounts || [];
    this.performanceHistory.activeSavings = allSavings.filter((s: any) => {
      if (!s.status) return false;
      if (typeof s.status === 'string') {
        return s.status.toLowerCase() === 'active';
      }
      if (typeof s.status === 'object' && s.status.value) {
        return s.status.value.toLowerCase() === 'active';
      }
      return false;
    }).length;
    // Total Savings: sum of balances
    this.performanceHistory.totalSavings = allSavings.reduce((sum: number, s: any) => sum + (s.accountBalance || 0), 0);
  }

  /**
   * Toggles Loan Accounts Overview
   */
  toggleLoanAccountsOverview() {
    this.showClosedLoanAccounts = !this.showClosedLoanAccounts;
  }

  /**
   * Toggles Loan Accounts Overview
   */
  toggleSavingAccountsOverview() {
    this.showClosedSavingAccounts = !this.showClosedSavingAccounts;
  }

  /**
   * Toggles Loan Accounts Overview
   */
  toggleShareAccountsOverview() {
    this.showClosedShareAccounts = !this.showClosedShareAccounts;
  }

  /**
   * Toggles Reccuring Accounts Overview
   */
  toggleRecurringAccountsOverview() {
    this.showClosedRecurringAccounts = !this.showClosedRecurringAccounts;
  }

  /**
   * Toggles Fixed Accounts Overview
   */
  toggleFixedAccountsOverview() {
    this.showClosedFixedAccounts = !this.showClosedFixedAccounts;
  }

  /**
   * Waive Charge.
   * @param chargeId Selected Charge Id.
   * @param clientId Selected Client Id.
   */
  waiveCharge(chargeId: string, clientId: string) {
    const charge = { clientId: clientId.toString(), resourceType: chargeId };
    this.clientService.waiveClientCharge(charge).subscribe(() => {
      this.getChargeData(clientId);
    });
  }

  /**
   * Get Charge Data.
   * @param clientId Selected Client Id.
   */
  getChargeData(clientId: string) {
    this.clientService.getClientChargesData(clientId).subscribe((data: any) => {
      this.upcomingCharges = data.pageItems;
    });
  }

  /**
   * Stops the propagation to view pages.
   * @param $event Mouse Event
   */
  routeEdit($event: MouseEvent) {
    $event.stopPropagation();
  }

  /**
   * @param {any} loanId Loan Id
   */
  routeTransferFund(loanId: any) {
    const queryParams: any = { loanId: loanId, accountType: 'fromloans' };
    this.router.navigate(
      [
        '../',
        'loans-accounts',
        loanId,
        'transfer-funds',
        'make-account-transfer'
      ],
      { relativeTo: this.route, queryParams: queryParams }
    );
  }

  viewAccountsLabel(closed: boolean): string {
    if (closed) {
      return 'labels.buttons.View Active Accounts';
    } else {
      return 'labels.buttons.View Closed Accounts';
    }
  }
}
