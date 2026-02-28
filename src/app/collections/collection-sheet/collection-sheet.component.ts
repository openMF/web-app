/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CollectionsService } from '../collections.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { OrganizationService } from 'app/organization/organization.service';
import { CentersService } from 'app/centers/centers.service';
import { GroupsService } from 'app/groups/groups.service';
import { Dates } from 'app/core/utils/dates';
import {
  CollectionSheetData,
  JLGGroupData,
  MeetingFallCenter,
  AttendanceType,
  CollectionClient,
  CollectionLoan,
  CollectionSavings,
  CollectionGroup
} from '../models/collection-sheet-data.model';
import { Logger } from 'app/core/logger/logger.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'mifosx-collection-sheet',
  templateUrl: './collection-sheet.component.html',
  styleUrl: './collection-sheet.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ]
})
export class CollectionSheetComponent implements OnInit {
  private readonly log = new Logger('CollectionSheetComponent');
  private formBuilder = inject(UntypedFormBuilder);
  private centerService = inject(CentersService);
  private collectionsService = inject(CollectionsService);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  /** Offices Data */
  officesData: any;
  /** Group Data */
  groupsData: any = [];
  /** All groups (unfiltered) for the selected staff */
  allGroupsData: any = [];
  /** Center Data */
  centersData: any = [];
  /** Loan Officer Data */
  loanOfficerData: any = [];
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Collection Sheet form. */
  collectionSheetForm: UntypedFormGroup;

  officeId: number | null = null;
  meetingFallCenters: MeetingFallCenter[] | null = null;

  /** JLG Collection Sheet Data */
  jlgGroupData: JLGGroupData | null = null;
  /** Whether the collection sheet is being loaded */
  isLoading = false;
  /** Whether saving is in progress */
  isSaving = false;
  /** The selected center name for display */
  selectedCenterName: string = '';
  /** Selected center ID */
  selectedCenterId: number | null = null;
  /** Calendar instance ID for saving */
  calendarId: number | null = null;

  /** Track loan payment overrides: [groupIdx][clientIdx][productId] = amount */
  loanPayments: { [key: string]: number } = {};
  /** Track savings deposit overrides: [groupIdx][clientIdx][productId] = amount */
  savingsDeposits: { [key: string]: number } = {};
  /** Track savings withdrawal amounts: [groupIdx][clientIdx][productId] = amount */
  savingsWithdrawals: { [key: string]: number } = {};
  /** Track attendance overrides: [groupIdx][clientIdx] = attendanceTypeId */
  attendanceOverrides: { [key: string]: number } = {};
  /** Track charge amount overrides: [groupIdx][clientIdx][chargeName] = amount */
  chargeOverrides: { [key: string]: number } = {};
  /** Unique client charge names across all clients in this sheet */
  uniqueChargeNames: string[] = [];

  /** Expose AttendanceType constants for template binding */
  readonly AttendanceType = AttendanceType;

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { officesData: any }) => {
      this.officesData = data.officesData;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;

    this.createCollectionSheetForm();
    this.buildDependencies();
  }

  createCollectionSheetForm() {
    this.collectionSheetForm = this.formBuilder.group({
      officeId: [
        '',
        Validators.required
      ],
      meetingDate: [
        new Date(),
        Validators.required
      ],
      staffId: [
        '',
        Validators.required
      ],
      groupId: [''],
      centerId: [
        '',
        Validators.required
      ]
    });
  }

  buildDependencies() {
    this.collectionSheetForm
      .get('officeId')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((officeId: any) => {
        this.officeId = officeId;
        this.jlgGroupData = null;
        this.meetingFallCenters = null;
        this.centersData = [];
        this.groupsData = [];

        this.collectionSheetForm.get('staffId').setValue('');
        this.collectionSheetForm.get('centerId').setValue('');
        this.collectionSheetForm.get('groupId').setValue('');

        if (officeId) {
          this.organizationService.getStaffs(officeId).subscribe((response: any) => {
            this.loanOfficerData = response;
          });
        }
      });

    this.collectionSheetForm
      .get('staffId')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((staffId: any) => {
        this.jlgGroupData = null;
        this.meetingFallCenters = null;
        this.collectionSheetForm.get('centerId').setValue('');
        this.collectionSheetForm.get('groupId').setValue('');
        this.centersData = [];
        this.groupsData = [];
        this.allGroupsData = [];

        if (staffId && this.officeId) {
          this.organizationService.getCenters(this.officeId, staffId).subscribe((response: any) => {
            this.centersData = response;
          });
          this.organizationService.getGroups(this.officeId, staffId).subscribe((response: any) => {
            this.allGroupsData = response;
          });
        }
      });

    this.collectionSheetForm
      .get('centerId')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((centerId: any) => {
        this.collectionSheetForm.get('groupId').setValue('');
        this.groupsData = centerId ? this.allGroupsData.filter((g: any) => g.centerId === centerId) : [];
      });
  }

  previewCollectionSheet() {
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const staffId = this.collectionSheetForm.value.staffId;
    const meetingDate = this.dateUtils.formatDate(this.collectionSheetForm.value.meetingDate, dateFormat);

    this.isLoading = true;
    this.jlgGroupData = null;
    this.loanPayments = {};
    this.savingsDeposits = {};
    this.attendanceOverrides = {};

    this.centerService
      .getAllMeetingFallCenters(this.officeId, staffId, meetingDate, dateFormat, locale)
      .subscribe((response: CollectionSheetData[]) => {
        if (response.length > 0 && response[0].meetingFallCenters?.length > 0) {
          this.meetingFallCenters = response[0].meetingFallCenters;

          // Use user-selected centerId if available, otherwise use first center
          const selectedCenterId = this.collectionSheetForm.value.centerId;
          let selectedCenter = this.meetingFallCenters[0];

          if (selectedCenterId) {
            const found = this.meetingFallCenters.find((c) => c.id === selectedCenterId);
            if (found) {
              selectedCenter = found;
            }
          }

          this.selectedCenterName = selectedCenter.name;
          this.selectedCenterId = selectedCenter.id;
          this.calendarId = selectedCenter.collectionMeetingCalendar.id;

          const payload = {
            calendarId: this.calendarId,
            transactionDate: meetingDate,
            locale,
            dateFormat
          };

          this.collectionsService.generateCollectionSheetData(selectedCenter.id, payload).subscribe({
            next: (jlgGroupData: JLGGroupData) => {
              this.log.debug('JLG Group Data:', jlgGroupData);
              this.jlgGroupData = jlgGroupData;
              this.extractUniqueChargeNames();
              this.isLoading = false;
            },
            error: (err) => {
              this.log.error('Failed to generate collection sheet:', err);
              this.isLoading = false;
            }
          });
        } else {
          this.isLoading = false;
          this.snackBar.open('No center meetings found for the selected date and criteria.', 'Close', {
            duration: 5000
          });
        }
      });
  }

  /** Go back to form view */
  backToForm() {
    this.jlgGroupData = null;
  }

  /** Find ALL loans for a specific product (a client can have multiple loans under same product) */
  getLoansForProduct(client: any, productId: number): any[] {
    if (!client.loans) return [];
    return client.loans.filter((loan: any) => loan.productId === productId);
  }

  /** Get the max number of rows needed for any client in a group for a specific product */
  getMaxLoansForProduct(group: any, productId: number): number {
    if (!group.clients) return 1;
    return Math.max(1, ...group.clients.map((c: any) => this.getLoansForProduct(c, productId).length));
  }

  /** Get total number of columns for the group row colspan */
  getFullColspan(): number {
    const loans = (this.jlgGroupData?.loanProducts?.length || 0) * 2;
    const savings = this.jlgGroupData?.savingsProducts?.length || 0;
    const charges = this.uniqueChargeNames?.length || 0;
    return 1 + loans + savings + charges + 2 + 1; // name + loans + savings + charges + total(2) + att
  }

  /** Get total loan rows a client needs (max across all products) */
  getClientRowSpan(client: any): number {
    if (!client.loans || client.loans.length <= 1) return 1;
    // Group loans by productId and find the max count
    const byProduct: { [key: number]: number } = {};
    client.loans.forEach((l: any) => {
      byProduct[l.productId] = (byProduct[l.productId] || 0) + 1;
    });
    return Math.max(1, ...Object.values(byProduct));
  }

  /** Find savings data for a specific product */
  getSavingsForProduct(client: any, productId: number): any {
    if (!client.savings) return null;
    return client.savings.find((s: any) => s.productId === productId) || null;
  }

  /** Extract unique charge names from all clients in the collection sheet */
  private extractUniqueChargeNames(): void {
    const chargeNameSet = new Set<string>();
    if (this.jlgGroupData?.groups) {
      for (const group of this.jlgGroupData.groups) {
        for (const client of group.clients || []) {
          for (const charge of client.clientCharges || []) {
            if (charge.chargeName) {
              chargeNameSet.add(charge.chargeName);
            }
          }
        }
      }
    }
    this.uniqueChargeNames = Array.from(chargeNameSet).sort();
  }

  /** Get a specific client's charge amount by charge name */
  getClientChargeByName(client: any, chargeName: string): number {
    if (!client.clientCharges) return 0;
    return client.clientCharges
      .filter((charge: any) => charge.chargeName === chargeName)
      .reduce((sum: number, charge: any) => sum + (charge.amount || 0), 0);
  }

  /** Get total active client charges due on the meeting date */
  getClientCharges(client: any): number {
    if (!client.clientCharges) return 0;
    return client.clientCharges.reduce((sum: number, charge: any) => sum + (charge.amount || 0), 0);
  }

  /** Get client total due (all loans + savings + charges) */
  getClientTotalDue(client: any): number {
    let total = 0;
    // Loan dues
    if (client.loans) {
      total += client.loans.reduce((sum: number, loan: any) => sum + (loan.totalDue || 0), 0);
    }
    // Savings dues
    if (client.savings) {
      total += client.savings.reduce((sum: number, s: any) => sum + (s.dueAmount || 0), 0);
    }
    // Client charges
    total += this.getClientCharges(client);
    return total;
  }

  /** Get client total collected (actual amounts entered/edited, minus withdrawals) */
  getClientTotalCollected(gi: number, ci: number, client: any): number {
    let total = 0;
    // Loan payments (edited or original)
    if (client.loans) {
      for (const loan of client.loans) {
        const key = `${gi}_${ci}_${loan.loanId}`;
        total += this.loanPayments[key] !== undefined ? this.loanPayments[key] : loan.totalDue || 0;
      }
    }
    // Savings deposits (edited or original) minus withdrawals
    if (client.savings) {
      for (const s of client.savings) {
        const depKey = `${gi}_${ci}_${s.productId}`;
        const deposit = this.savingsDeposits[depKey] !== undefined ? this.savingsDeposits[depKey] : s.dueAmount || 0;
        const withdrawal = this.savingsWithdrawals[depKey] || 0;
        total += deposit - withdrawal;
      }
    }
    // Client charges (editable)
    for (const chargeName of this.uniqueChargeNames) {
      total += this.getChargeAmount(gi, ci, client, chargeName);
    }
    return total;
  }

  /** Get group total due */
  getGroupTotalDue(group: any): number {
    if (!group.clients) return 0;
    return group.clients.reduce((sum: number, client: any) => sum + this.getClientTotalDue(client), 0);
  }

  /** Get group total collected */
  getGroupTotalCollected(group: any, gi: number): number {
    if (!group.clients) return 0;
    return group.clients.reduce(
      (sum: number, client: any, ci: number) => sum + this.getClientTotalCollected(gi, ci, client),
      0
    );
  }

  /** Get center total due */
  getCenterTotalDue(): number {
    if (!this.jlgGroupData?.groups) return 0;
    return this.jlgGroupData.groups.reduce((sum: number, group: any) => sum + this.getGroupTotalDue(group), 0);
  }

  /** Get center total collected */
  getCenterTotalCollected(): number {
    if (!this.jlgGroupData?.groups) return 0;
    return this.jlgGroupData.groups.reduce(
      (sum: number, group: any, gi: number) => sum + this.getGroupTotalCollected(group, gi),
      0
    );
  }

  /** Get group-level total for a specific loan product field (sums across ALL loans per product) */
  getGroupLoanTotal(group: any, productId: number, field: string): number {
    if (!group.clients) return 0;
    return group.clients.reduce((sum: number, client: any) => {
      const loans = this.getLoansForProduct(client, productId);
      return sum + loans.reduce((s: number, loan: any) => s + (loan[field] || 0), 0);
    }, 0);
  }

  /** Get group-level total charges */
  getGroupChargesTotal(group: any): number {
    if (!group.clients) return 0;
    return group.clients.reduce((sum: number, client: any) => sum + this.getClientCharges(client), 0);
  }

  /** Get group-level total charges by charge name */
  getGroupChargeTotalByName(group: any, chargeName: string): number {
    if (!group.clients) return 0;
    return group.clients.reduce((sum: number, client: any) => sum + this.getClientChargeByName(client, chargeName), 0);
  }

  /** Get group-level total savings for a product (reads editable deposits) */
  getGroupSavingsTotal(group: any, productId: number, gi?: number): number {
    if (!group.clients) return 0;
    // If gi is provided, use editable deposit amounts
    const groupIdx = gi !== undefined ? gi : (this.jlgGroupData?.groups?.indexOf(group) ?? -1);
    return group.clients.reduce((sum: number, client: any, ci: number) => {
      const savings = this.getSavingsForProduct(client, productId);
      if (!savings) return sum;
      if (groupIdx >= 0) {
        const depKey = `${groupIdx}_${ci}_${productId}`;
        return (
          sum + (this.savingsDeposits[depKey] !== undefined ? this.savingsDeposits[depKey] : savings.dueAmount || 0)
        );
      }
      return sum + (savings.dueAmount || 0);
    }, 0);
  }

  /** Get center-level total for a specific loan product */
  getCenterLoanTotal(field: string): number {
    if (!this.jlgGroupData?.groups) return 0;
    return this.jlgGroupData.loanProducts.reduce((total: number, product: any) => {
      return (
        total +
        this.jlgGroupData.groups.reduce((sum: number, group: any) => {
          return sum + this.getGroupLoanTotal(group, product.id, field);
        }, 0)
      );
    }, 0);
  }

  /** Get center-level total for a specific loan product (per-product) */
  getCenterLoanTotalForProduct(productId: number, field: string): number {
    if (!this.jlgGroupData?.groups) return 0;
    return this.jlgGroupData.groups.reduce((sum: number, group: any) => {
      return sum + this.getGroupLoanTotal(group, productId, field);
    }, 0);
  }

  /** Get center-level total charges by charge name */
  getCenterChargeTotalByName(chargeName: string): number {
    if (!this.jlgGroupData?.groups) return 0;
    return this.jlgGroupData.groups.reduce((sum: number, group: any) => {
      return sum + this.getGroupChargeTotalByName(group, chargeName);
    }, 0);
  }

  /** Get center-level total savings for a specific product (reads editable deposits) */
  getCenterSavingsTotalForProduct(productId: number): number {
    if (!this.jlgGroupData?.groups) return 0;
    return this.jlgGroupData.groups.reduce((sum: number, group: any, gi: number) => {
      return sum + this.getGroupSavingsTotal(group, productId, gi);
    }, 0);
  }

  /** Get center-level total loan collected (actual paid amounts) */
  getCenterLoanTotalCollected(): number {
    if (!this.jlgGroupData?.groups) return 0;
    let total = 0;
    this.jlgGroupData.groups.forEach((group: any, gi: number) => {
      if (!group.clients) return;
      group.clients.forEach((client: any, ci: number) => {
        if (!client.loans) return;
        for (const loan of client.loans) {
          const key = `${gi}_${ci}_${loan.loanId}`;
          total += this.loanPayments[key] !== undefined ? this.loanPayments[key] : loan.totalDue || 0;
        }
      });
    });
    return total;
  }

  /** Get center-level total loan due (static from API) */
  getCenterLoanTotalDue(): number {
    if (!this.jlgGroupData?.groups) return 0;
    let total = 0;
    this.jlgGroupData.groups.forEach((group: any) => {
      if (!group.clients) return;
      group.clients.forEach((client: any) => {
        if (!client.loans) return;
        for (const loan of client.loans) {
          total += loan.totalDue || 0;
        }
      });
    });
    return total;
  }

  /** Get center-level total savings due (static from API, all products) */
  getCenterSavingsTotalDue(): number {
    if (!this.jlgGroupData?.groups) return 0;
    let total = 0;
    this.jlgGroupData.groups.forEach((group: any) => {
      if (!group.clients) return;
      group.clients.forEach((client: any) => {
        if (!client.savings) return;
        for (const s of client.savings) {
          total += s.dueAmount || 0;
        }
      });
    });
    return total;
  }

  /** Get center-level total savings collected (editable deposits, all products) */
  getCenterSavingsTotalCollected(): number {
    if (!this.jlgGroupData?.groups) return 0;
    let total = 0;
    this.jlgGroupData.groups.forEach((group: any, gi: number) => {
      if (!group.clients) return;
      group.clients.forEach((client: any, ci: number) => {
        if (!client.savings) return;
        for (const s of client.savings) {
          const depKey = `${gi}_${ci}_${s.productId}`;
          total += this.savingsDeposits[depKey] !== undefined ? this.savingsDeposits[depKey] : s.dueAmount || 0;
        }
      });
    });
    return total;
  }

  /** Get center-level total charges due (static from API) */
  getCenterChargeTotalDue(): number {
    if (!this.jlgGroupData?.groups) return 0;
    let total = 0;
    this.jlgGroupData.groups.forEach((group: any) => {
      if (!group.clients) return;
      group.clients.forEach((client: any) => {
        total += this.getClientCharges(client);
      });
    });
    return total;
  }

  /** Get center-level total charges collected (reads from chargeOverrides) */
  getCenterChargeTotalCollected(): number {
    if (!this.jlgGroupData?.groups) return 0;
    let total = 0;
    this.jlgGroupData.groups.forEach((group: any, gi: number) => {
      if (!group.clients) return;
      group.clients.forEach((client: any, ci: number) => {
        for (const chargeName of this.uniqueChargeNames) {
          total += this.getChargeAmount(gi, ci, client, chargeName);
        }
      });
    });
    return total;
  }

  /** Get attendance value for a client */
  getAttendanceValue(client: any, groupIdx: number, clientIdx: number): number {
    const key = `${groupIdx}_${clientIdx}`;
    if (this.attendanceOverrides[key] !== undefined) {
      return this.attendanceOverrides[key];
    }
    return client.attendanceType?.id || AttendanceType.PRESENT;
  }

  /** Set attendance for a client */
  setAttendanceToggle(groupIdx: number, clientIdx: number, value: number) {
    this.attendanceOverrides[`${groupIdx}_${clientIdx}`] = value;
  }

  /** Set loan payment amount (keyed by loanId to support multiple loans per product) */
  setLoanPayment(groupIdx: number, clientIdx: number, loanId: number, event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.loanPayments[`${groupIdx}_${clientIdx}_${loanId}`] = value;
  }

  /** Set savings deposit amount */
  setSavingsDeposit(groupIdx: number, clientIdx: number, productId: number, event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.savingsDeposits[`${groupIdx}_${clientIdx}_${productId}`] = value;
  }

  /** Set savings withdrawal amount */
  setSavingsWithdrawal(groupIdx: number, clientIdx: number, productId: number, event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.savingsWithdrawals[`${groupIdx}_${clientIdx}_${productId}`] = value;
  }

  /** Set charge amount override */
  setChargeOverride(groupIdx: number, clientIdx: number, chargeName: string, event: Event) {
    const value = parseFloat((event.target as HTMLInputElement).value) || 0;
    this.chargeOverrides[`${groupIdx}_${clientIdx}_${chargeName}`] = value;
  }

  /** Get the current charge amount (overridden or original) */
  getChargeAmount(gi: number, ci: number, client: any, chargeName: string): number {
    const key = `${gi}_${ci}_${chargeName}`;
    if (this.chargeOverrides[key] !== undefined) return this.chargeOverrides[key];
    return this.getClientChargeByName(client, chargeName);
  }

  /** Get savings withdrawal amount for a product */
  getSavingsWithdrawal(gi: number, ci: number, productId: number): number {
    return this.savingsWithdrawals[`${gi}_${ci}_${productId}`] || 0;
  }

  /** Get the current payment amount for a loan */
  getLoanPaymentAmount(groupIdx: number, clientIdx: number, productId: number, defaultAmount: number): number {
    const key = `${groupIdx}_${clientIdx}_${productId}`;
    return this.loanPayments[key] !== undefined ? this.loanPayments[key] : defaultAmount;
  }

  /** Submit the collection sheet */
  submitCollectionSheet() {
    if (!this.jlgGroupData || !this.selectedCenterId) return;

    this.isSaving = true;
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const meetingDate = this.dateUtils.formatDate(this.collectionSheetForm.value.meetingDate, dateFormat);

    // Build the hierarchical payload to match CustomCollectionSheetWritePlatformService expectation
    const groups: any[] = [];

    this.jlgGroupData.groups.forEach((group: any, gi: number) => {
      const gPayload: any = {
        groupId: group.groupId,
        clients: []
      };

      group.clients.forEach((client: any, ci: number) => {
        const clientPayload: any = {
          clientId: client.clientId,
          attendanceType: this.getAttendanceValue(client, gi, ci),
          loans: [],
          savings: [],
          clientCharges: []
        };

        // Loan repayments — iterate ALL loans (multiple per product possible)
        if (client.loans) {
          client.loans.forEach((loan: any) => {
            const paymentKey = `${gi}_${ci}_${loan.loanId}`;
            const amount = this.loanPayments[paymentKey] !== undefined ? this.loanPayments[paymentKey] : loan.totalDue;
            if (amount > 0) {
              clientPayload.loans.push({
                loanId: loan.loanId,
                transactionAmount: amount
              });
            }
          });
        }

        // Savings deposits AND withdrawals
        if (client.savings) {
          client.savings.forEach((savings: any) => {
            const depositKey = `${gi}_${ci}_${savings.productId}`;
            // Deposit amount
            const depositAmount =
              this.savingsDeposits[depositKey] !== undefined ? this.savingsDeposits[depositKey] : savings.dueAmount;
            if (depositAmount > 0) {
              clientPayload.savings.push({
                savingsId: savings.savingsId,
                transactionAmount: depositAmount
              });
            }
            // Withdrawal amount
            const withdrawalAmount = this.savingsWithdrawals[depositKey] || 0;
            if (withdrawalAmount > 0) {
              clientPayload.savings.push({
                savingsId: savings.savingsId,
                transactionAmount: withdrawalAmount,
                isWithdrawal: true
              });
            }
          });
        }

        // Client charges (editable)
        if (client.clientCharges) {
          client.clientCharges.forEach((charge: any) => {
            const chargeKey = `${gi}_${ci}_${charge.chargeName}`;
            const amount =
              this.chargeOverrides[chargeKey] !== undefined ? this.chargeOverrides[chargeKey] : charge.amount || 0;
            if (amount > 0) {
              clientPayload.clientCharges.push({
                clientChargeId: charge.chargeId,
                transactionAmount: amount
              });
            }
          });
        }

        gPayload.clients.push(clientPayload);
      });
      groups.push(gPayload);
    });

    const payload: any = {
      centerId: this.selectedCenterId,
      officeId: this.officeId,
      staffId: this.collectionSheetForm.value.staffId,
      calendarId: this.calendarId,
      transactionDate: meetingDate,
      dateFormat,
      locale,
      groups: groups
    };

    this.collectionsService.saveCollectionSheetForCenter(this.selectedCenterId, payload).subscribe({
      next: (response: any) => {
        this.log.debug('Collection sheet submitted for async processing:', response);
        this.isSaving = false;
        // The API returns a CommandProcessingResult where entityId/resourceId is the collectionSheetId
        if (response && response.resourceId) {
          this.router.navigate([
            '/collections/sheet-status',
            response.resourceId
          ]);
        } else {
          // Fallback if empty response
          this.jlgGroupData = null;
          this.snackBar.open('Collection sheet submitted, but could not determine sheet ID to view status.', 'Close', {
            duration: 5000
          });
        }
      },
      error: (err: any) => {
        this.log.error('Failed to save collection sheet:', err);
        this.isSaving = false;
        // Extract detailed validation error messages from Fineract API response
        let errorMsg = 'Failed to save collection sheet. Please try again.';
        if (err?.error?.errors?.length > 0) {
          errorMsg = err.error.errors.map((e: any) => e.defaultUserMessage || e.developerMessage).join('; ');
        } else if (err?.error?.defaultUserMessage) {
          errorMsg = err.error.defaultUserMessage;
        }
        this.snackBar.open(errorMsg, 'Close', { duration: 8000 });
      }
    });
  }

  /** Calculate percentage with clamping to 0-100 range. Used in summary progress bars. */
  getPercentage(collected: number, due: number): number {
    return due > 0 ? Math.min(100, (collected / due) * 100) : 100;
  }
}
