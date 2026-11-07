/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CollectionsService } from '../collections.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatProgressBar } from '@angular/material/progress-bar';
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
import { finalize } from 'rxjs/operators';
import { FormatNumberPipe } from 'app/pipes/format-number.pipe';

import { OrganizationService } from 'app/organization/organization.service';
import { CentersService } from 'app/centers/centers.service';
import { GroupsService } from 'app/groups/groups.service';
import { Dates } from 'app/core/utils/dates';
import { CollectionSheetData, JLGGroupData, MeetingFallCenter } from '../models/collection-sheet-data.model';

/** One loan or savings account due in the collection sheet. */
export interface CollectionSheetRow {
  clientName: string;
  accountType: 'Loan' | 'Savings';
  accountId: string;
  productName: string;
  totalDue: number;
}

/** A group of the collection sheet with its accounts due. */
export interface CollectionSheetGroup {
  groupId: number;
  groupName: string;
  rows: CollectionSheetRow[];
}

@Component({
  selector: 'mifosx-collection-sheet',
  templateUrl: './collection-sheet.component.html',
  styleUrl: './collection-sheet.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatProgressBar,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CollectionSheetComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private centerService = inject(CentersService);
  private collectionsService = inject(CollectionsService);
  private organizationService = inject(OrganizationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private destroyRef = inject(DestroyRef);
  private changeDetectorRef = inject(ChangeDetectorRef);

  /** Offices Data */
  officesData: any;
  /** Group Data */
  groupsData: any = [];
  /** Center Data */
  centersData: any = [];
  /** Loan Officer Data */
  loanOfficerData: any = [];
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Collection Sheet form. */
  collectionSheetForm: FormGroup;

  officeId: number | null = null;
  meetingFallCenters: MeetingFallCenter[] | null = null;

  /** True while the collection sheet is being retrieved. */
  isLoading = false;
  /** True when no center has a meeting for the selected criteria. */
  noMeetings = false;
  /** Center whose collection sheet is shown. */
  selectedCenter: MeetingFallCenter | null = null;
  /** Groups of the collection sheet shown, with their accounts due. */
  collectionSheetGroups: CollectionSheetGroup[] | null = null;

  /** Columns of the meeting centers table. */
  centersDisplayedColumns: string[] = [
    'name',
    'totalDue',
    'totalOverdue',
    'actions'
  ];
  /** Columns of the collection sheet table. */
  sheetDisplayedColumns: string[] = [
    'clientName',
    'accountType',
    'accountId',
    'productName',
    'totalDue'
  ];

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} collectionsService Organization Service.
   * @param {Route} route Route.
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {Dialog} dialog Dialog component.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
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

  /**
   * Creates the Individual Collection Sheet Form
   */
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
      centerId: ['']
    });
  }

  /**
   * Checks for the office id value change
   */
  buildDependencies() {
    this.collectionSheetForm
      .get('officeId')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((officeId: any) => {
        this.officeId = officeId;
        this.organizationService.getStaffs(officeId).subscribe((response: any) => {
          this.loanOfficerData = response;
        });
        this.organizationService.getCenters(officeId).subscribe((response: any) => {
          this.centersData = response;
        });
        this.organizationService.getGroups(officeId).subscribe((response: any) => {
          this.groupsData = response;
        });
      });
  }

  /**
   * Retrieves the centers meeting on the selected date and shows the collection sheet.
   * When a center is selected, or only one center meets, its sheet is loaded directly.
   */
  previewCollectionSheet() {
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const { staffId, centerId } = this.collectionSheetForm.value;
    const meetingDate = this.dateUtils.formatDate(this.collectionSheetForm.value.meetingDate, dateFormat);

    this.meetingFallCenters = null;
    this.selectedCenter = null;
    this.collectionSheetGroups = null;
    this.noMeetings = false;
    this.isLoading = true;

    this.centerService
      .getAllMeetingFallCenters(this.officeId, staffId, meetingDate, dateFormat, locale)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe((response: CollectionSheetData[]) => {
        let centers = response?.[0]?.meetingFallCenters ?? [];
        if (centerId) {
          centers = centers.filter((center: MeetingFallCenter) => center.id === centerId);
        }
        this.meetingFallCenters = centers;
        this.noMeetings = centers.length === 0;
        if (centers.length === 1) {
          this.viewCollectionSheet(centers[0]);
        }
      });
  }

  /**
   * Generates and shows the collection sheet of a center.
   * @param {MeetingFallCenter} center Center meeting on the selected date.
   */
  viewCollectionSheet(center: MeetingFallCenter) {
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const payload = {
      calendarId: center.collectionMeetingCalendar?.calendarInstanceId,
      transactionDate: this.dateUtils.formatDate(this.collectionSheetForm.value.meetingDate, dateFormat),
      locale,
      dateFormat
    };

    this.selectedCenter = center;
    this.collectionSheetGroups = null;
    this.isLoading = true;

    this.collectionsService
      .generateCollectionSheetData(center.id, payload)
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        })
      )
      .subscribe((jlgGroupData: JLGGroupData) => {
        this.collectionSheetGroups = this.buildCollectionSheetGroups(jlgGroupData);
      });
  }

  /**
   * Flattens the clients of each group into one row per account due,
   * keeping only the group selected in the form when there is one.
   * @param {JLGGroupData} jlgGroupData Generated collection sheet.
   */
  private buildCollectionSheetGroups(jlgGroupData: JLGGroupData): CollectionSheetGroup[] {
    const groupId = this.collectionSheetForm.value.groupId;
    return (jlgGroupData?.groups ?? [])
      .filter((group: any) => !groupId || group.groupId === groupId)
      .map((group: any) => ({
        groupId: group.groupId,
        groupName: group.groupName,
        rows: (group.clients ?? []).flatMap((client: any) => [
          ...(client.loans ?? []).map((loan: any) => ({
            clientName: client.clientName,
            accountType: 'Loan' as const,
            accountId: loan.accountId,
            productName: loan.productShortName,
            totalDue: loan.totalDue
          })),
          ...(client.savings ?? []).map((savings: any) => ({
            clientName: client.clientName,
            accountType: 'Savings' as const,
            accountId: savings.accountId,
            productName: savings.productName,
            totalDue: savings.dueAmount
          }))
        ])
      }))
      .filter((group: CollectionSheetGroup) => group.rows.length > 0);
  }
}
