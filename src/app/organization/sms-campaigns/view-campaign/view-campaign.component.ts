/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import {
  MatTableDataSource,
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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { DataReloadService } from 'app/core/services/data-reload.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { MatList, MatListItem } from '@angular/material/list';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * View SMS Campaign Component
 */
@Component({
  selector: 'mifosx-view-campaign',
  templateUrl: './view-campaign.component.html',
  styleUrls: ['./view-campaign.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTabGroup,
    MatTab,
    MatList,
    MatListItem,
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
    DateFormatPipe
  ]
})
export class ViewCampaignComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);
  private organizationService = inject(OrganizationService);
  private settingsService = inject(SettingsService);
  private dataReloadService = inject(DataReloadService);

  minDate = new Date(2000, 0, 1);
  maxDate = new Date();
  smsForm: UntypedFormGroup;
  smsCampaignData: any;
  status: any;
  displayedColumns: string[] = [
    'Message',
    'Status',
    'Mobile No.',
    'Campaign Name'
  ];
  dataSource = new MatTableDataSource();

  private reloadContext!: string;
  private destroy$ = new Subject<void>();

  /** Message Table Reference */
  @ViewChild('messageTable') messageTableRef: MatTable<Element>;

  /** SMS Camapaign Tabs */
  smsTabs: any[] = [
    {
      label: 'Pending SMS',
      status: 100
    },
    {
      label: 'Waiting for Delivery Report',
      status: 150
    },
    {
      label: 'Sent SMS',
      status: 200
    },
    {
      label: 'Delivered SMS',
      status: 300
    },
    {
      label: 'Failed SMS',
      status: 400
    }
  ];

  ngOnInit(): void {
    this.route.data.pipe(takeUntil(this.destroy$)).subscribe((data: { smsCampaign: any }) => {
      this.smsCampaignData = data.smsCampaign;
      this.reloadContext = `sms-campaign-${this.smsCampaignData.id}`;

      // Subscribe to reload events after we have the campaign ID
      this.dataReloadService
        .getReloadObservable(this.reloadContext)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.refreshData();
        });
    });

    this.maxDate = this.settingsService.businessDate;
    this.createSMSForm();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    if (this.reloadContext) {
      this.dataReloadService.cleanup(this.reloadContext);
    }
  }

  /**
   * Creates the SMS form.
   */
  createSMSForm() {
    this.smsForm = this.formBuilder.group({
      fromDate: [''],
      toDate: ['']
    });
  }

  /**
   * Sets status for messages on tab change.
   * Clears data in messages table if any.
   * Resets the search form.
   * @param {any} $event Tab change event.
   */
  onTabChange($event: any) {
    const selectedTabName = $event.tab ? $event.tab.textLabel : 'Campaign';
    const tab = this.smsTabs.find((entry: any) => selectedTabName === entry.label);
    this.status = tab ? tab.status : undefined;
    this.dataSource.data = [];
    this.messageTableRef.renderRows();
    this.smsForm.reset();
  }

  /**
   * Closes the SMS Campaign.
   */
  closeCampaign() {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'closureDate',
        label: 'Closure Date',
        value: '',
        type: 'date',
        required: true
      })
    ];
    const data = {
      title: 'Close SMS Campaign',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const closeCampaignDialogRef = this.dialog.open(FormDialogComponent, { data });
    closeCampaignDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        const dataObject = {
          closureDate: this.dateUtils.formatDate(response.data.value.closureDate, dateFormat),
          dateFormat,
          locale
        };
        this.organizationService
          .executeSmsCampaignCommand(this.smsCampaignData.id, dataObject, 'close')
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Activates the SMS Campaign.
   */
  activateCampaign() {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'activationDate',
        label: 'Activation Date',
        value: '',
        type: 'date',
        required: true
      })
    ];
    const data = {
      title: 'Activate SMS Campaign',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const activateCampaignDialogRef = this.dialog.open(FormDialogComponent, { data });
    activateCampaignDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        const dataObject = {
          activationDate: this.dateUtils.formatDate(response.data.value.activationDate, dateFormat),
          dateFormat,
          locale
        };
        this.organizationService
          .executeSmsCampaignCommand(this.smsCampaignData.id, dataObject, 'activate')
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Reactivates the SMS Campaign.
   */
  reactivateCampaign() {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'activationDate',
        label: 'Reactivation Date',
        value: '',
        type: 'date',
        required: true
      })
    ];
    const data = {
      title: 'Reactivate SMS Campaign',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const reactivateCampaignDialogRef = this.dialog.open(FormDialogComponent, { data });
    reactivateCampaignDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        const dataObject = {
          activationDate: this.dateUtils.formatDate(response.data.value.activationDate, dateFormat),
          dateFormat,
          locale
        };
        this.organizationService
          .executeSmsCampaignCommand(this.smsCampaignData.id, dataObject, 'reactivate')
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

  /**
   * Deletes the SMS Campaign.
   */
  deleteCampaign() {
    const deleteSmsCampaignDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `sms campaing with id: ${this.smsCampaignData.id}` }
    });
    deleteSmsCampaignDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.organizationService.deleteSmsCampaign(this.smsCampaignData.id).subscribe(() => {
          this.router.navigate(['../'], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Triggers a reload event for this campaign.
   */
  private reload(): void {
    this.dataReloadService.triggerReload(this.reloadContext);
  }

  /**
   * Refreshes the campaign data when reload is triggered.
   */
  private refreshData(): void {
    this.organizationService
      .getSmsCampaign(this.smsCampaignData.id)
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: any) => {
        this.smsCampaignData = data;
      });
  }

  /**
   * Retrives messages by status.
   */
  search() {
    const smsFormData = this.smsForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevFromDate: Date = this.smsForm.value.fromDate;
    const prevToDate: Date = this.smsForm.value.toDate;
    if (smsFormData.fromDate instanceof Date) {
      smsFormData.fromDate = this.dateUtils.formatDate(prevFromDate, dateFormat);
    }
    if (smsFormData.toDate instanceof Date) {
      smsFormData.toDate = this.dateUtils.formatDate(prevToDate, dateFormat);
    }
    const data = {
      ...smsFormData,
      id: this.smsCampaignData.id,
      status: this.status,
      dateFormat,
      locale
    };
    this.organizationService.getMessagebyStatus(data).subscribe((response: any) => {
      this.dataSource.data = response.pageItems;
      this.messageTableRef.renderRows();
    });
  }
}
