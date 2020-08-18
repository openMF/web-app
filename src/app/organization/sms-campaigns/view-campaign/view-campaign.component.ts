/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * View SMS Campaign Component
 */
@Component({
  selector: 'mifosx-view-campaign',
  templateUrl: './view-campaign.component.html',
  styleUrls: ['./view-campaign.component.scss']
})
export class ViewCampaignComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** SMS form. */
  smsForm: FormGroup;
  /** SMS Campaign data. */
  smsCampaignData: any;
  /** Message Status */
  status: any;
  /** Data Table Columns */
  displayedColumns: string[] = ['Message', 'Status', 'Mobile No.', 'Campaign Name'];
  /** Data source for SMS campaigns table. */
  dataSource = new MatTableDataSource();

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

  /**
   * Retrieves the SMS Campaign data from `resolve
   * @param {Router} router Router
   * @param {ActivatedRoute} route Activated Route
   * @param {MatDialog} dialog Mat Dialog
   * @param {FormBuilder} formBuilder Form Builder
   * @param {DatePipe} datePipe Date Pipe
   * @param {OrganizationService} organizationService Organization Service
   */
  constructor(private router: Router,
              private route: ActivatedRoute,
              public dialog: MatDialog,
              private formBuilder: FormBuilder,
              private datePipe: DatePipe,
              private organizationService: OrganizationService) {
    this.route.data.subscribe((data: { smsCampaign: any }) => {
      this.smsCampaignData = data.smsCampaign;
    });
  }


  ngOnInit() {
    this.createSMSForm();
  }

  /**
   * Creates the SMS form.
   */
  createSMSForm() {
    this.smsForm = this.formBuilder.group({
      'fromDate': [''],
      'toDate': [''],
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
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const dataObject = {
          closureDate: this.datePipe.transform(response.data.value.closureDate, dateFormat),
          dateFormat,
          locale
        };
        this.organizationService.executeSmsCampaignCommand(this.smsCampaignData.id, dataObject,  'close').subscribe(() => {
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
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const dataObject = {
          activationDate: this.datePipe.transform(response.data.value.activationDate, dateFormat),
          dateFormat,
          locale
        };
        this.organizationService.executeSmsCampaignCommand(this.smsCampaignData.id, dataObject,  'activate').subscribe(() => {
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
        const locale = 'en';
        const dateFormat = 'dd MMMM yyyy';
        const dataObject = {
          activationDate: this.datePipe.transform(response.data.value.activationDate, dateFormat),
          dateFormat,
          locale
        };
        this.organizationService.executeSmsCampaignCommand(this.smsCampaignData.id, dataObject,  'reactivate').subscribe(() => {
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
   * Refetches data fot the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  private reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/organization/sms-campaigns`, {skipLocationChange: true})
      .then(() => this.router.navigate([url]));
  }

  /**
   * Retrives messages by status.
   */
  search() {
    const prevFromDate: Date = this.smsForm.value.fromDate;
    const prevToDate: Date = this.smsForm.value.toDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.smsForm.patchValue({
      fromDate: this.datePipe.transform(prevFromDate, dateFormat),
      toDate: this.datePipe.transform(prevToDate, dateFormat)
    });
    const SMS = this.smsForm.value;
    SMS.id = this.smsCampaignData.id;
    SMS.locale = 'en';
    SMS.dateFormat = dateFormat;
    SMS.status = this.status;
    this.organizationService.getMessagebyStatus(SMS).subscribe((response: any) => {
      this.dataSource.data = response.pageItems;
      this.messageTableRef.renderRows();
    });
  }

}
