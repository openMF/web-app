/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute , ActivatedRouteSnapshot} from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material';

/** rxjs Imports */
import { Observable } from 'rxjs';

/** Custom Services */
import { OrganizationService } from '../../../organization.service';

@Component({
  selector: 'mifosx-pending-sms-tab',
  templateUrl: './sms-campaign-tabs.component.html',
  styleUrls: ['./sms-campaign-tabs.component.scss']
})
export class SmsCampaignTabsComponent implements OnInit {

  /** Minimum from/to date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum from/to date allowed. */
  maxDate = new Date();
  /** fetchSMS form. */
  fetchSMSForm: FormGroup;
  /** SMS Campaign data. */
  smsCampaignData: any;
  /** SMS List datasource. */
  smsList = new MatTableDataSource();
  /** Status of tab. */
  status: any;
  /** Displayed Columns */
  displayedColumns: string[] = ['message', 'status', 'mobileNo', 'campaignName'];

  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe, ) {
      this.route.data.subscribe((data: { smsCampaign: any }) => {
        this.smsCampaignData = data.smsCampaign;
    });
    if (this.route.snapshot.params.tabname === 'pendingsms') {
      this.status = '100';
    }
    if (this.route.snapshot.params.tabname === 'waitingfordeliveryreport') {
      this.status = '150';
    }
    if (this.route.snapshot.params.tabname === 'sentsms') {
      this.status = '200';
    }
    if (this.route.snapshot.params.tabname === 'deliveredsms') {
      this.status = '300';
    }
    if (this.route.snapshot.params.tabname === 'failedsms') {
      this.status = '400';
    }
  }

  ngOnInit() {
    this.createfetchSMSForm();
  }

  createfetchSMSForm() {
    this.fetchSMSForm = this.formBuilder.group({
      'fromDate': ['', Validators.required],
      'toDate': ['', Validators.required]
    });
  }

  submit($event: any) {
    $event.preventDefault();
    const prevFromDate: Date = this.fetchSMSForm.value.fromDate;
    const prevToDate: Date = this.fetchSMSForm.value.toDate;
    const dateFormat = 'dd-MMMM-yyyy';
    this.fetchSMSForm.patchValue({
      fromDate: this.datePipe.transform(prevFromDate, dateFormat),
      toDate: this.datePipe.transform(prevToDate, dateFormat)
    });
    const fetchSMS = this.fetchSMSForm.value;
    // TODO: Update once language and date settings are setup
    fetchSMS.locale = 'en';
    fetchSMS.status = this.status;
    fetchSMS.id = this.smsCampaignData.id;
    fetchSMS.dateFormat = dateFormat;
    this.organizationService.getSmsCampaignbyStatus(fetchSMS).subscribe(
      (data => {
          this.smsList = new MatTableDataSource(data.pageItems);
          console.log(data);
      })
    );
  }

}
