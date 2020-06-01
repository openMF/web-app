/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatTableDataSource, MatTable } from '@angular/material';
import { ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

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
   * Retrieves the SMS Campaign data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {FormBuilder} formBuilder Form Builder
   * @param {DatePipe} datePipe Date Pipe
   * @param {OrganizationService} organizationService Organization Service
   */
  constructor(private route: ActivatedRoute,
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
