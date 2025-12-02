import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { CollectionsService } from '../collections.service';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

import { OrganizationService } from 'app/organization/organization.service';
import { CentersService } from 'app/centers/centers.service';
import { GroupsService } from 'app/groups/groups.service';
import { Dates } from 'app/core/utils/dates';
import { CollectionSheetData, JLGGroupData, MeetingFallCenter } from '../models/collection-sheet-data.model';

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
  collectionSheetForm: UntypedFormGroup;

  officeId: number | null = null;
  meetingFallCenters: MeetingFallCenter[] | null = null;

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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private centerService: CentersService,
    private collectionsService: CollectionsService,
    private organizationService: OrganizationService,
    private router: Router,
    private route: ActivatedRoute,
    private settingsService: SettingsService,
    private dateUtils: Dates
  ) {
    this.route.data.subscribe((data: { officesData: any }) => {
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
    this.collectionSheetForm.get('officeId').valueChanges.subscribe((officeId: any) => {
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

  previewCollectionSheet() {
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const staffId = this.collectionSheetForm.value.staffId;
    const meetingDate = this.dateUtils.formatDate(this.collectionSheetForm.value.meetingDate, dateFormat);

    this.centerService
      .getAllMeetingFallCenters(this.officeId, staffId, meetingDate, dateFormat, locale)
      .subscribe((response: CollectionSheetData[]) => {
        if (response.length > 0) {
          this.meetingFallCenters = response[0].meetingFallCenters;
          const payload = {
            calendarId: this.meetingFallCenters[0].collectionMeetingCalendar.calendarInstanceId,
            transactionDate: meetingDate,
            locale,
            dateFormat
          };
          this.collectionsService
            .generateCollectionSheetData(this.meetingFallCenters[0].id, payload)
            .subscribe((jlgGroupData: JLGGroupData) => {
              console.log(jlgGroupData);
            });
        }
      });
  }
}
