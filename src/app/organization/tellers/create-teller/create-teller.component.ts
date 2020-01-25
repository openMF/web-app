/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from '../../organization.service';

/**
 * Create teller component.
 */
@Component({
  selector: 'mifosx-create-teller',
  templateUrl: './create-teller.component.html',
  styleUrls: ['./create-teller.component.scss']
})
export class CreateTellerComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Teller form. */
  tellerForm: FormGroup;
  /** Office data. */
  officeData: any;
  /** TellerStatuses data. */
  tellerStatusesData: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
    this.tellerStatusesData = [{'id': 300, 'code': '300', 'value': 'Active'},
     {'id': 400, 'code': '400', 'value': 'Inactive'}];
  }

  /**
   * Creates the teller form.
   */
  ngOnInit() {
    this.createTellerForm();
  }

  /**
   * Creates the teller form.
   */
  createTellerForm() {
    this.tellerForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'name': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'description': [''],
      'startDate': ['', Validators.required],
      'endDate': [''],
      'status': ['', Validators.required],
    });
  }

  /**
   * Submits the teller form and creates teller,
   * if successful redirects to tellers.
   */
  submit() {
    const prevStartDate: Date = this.tellerForm.value.startDate;
    const prevEndDate: Date = this.tellerForm.value.endDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.tellerForm.patchValue({
      startDate: this.datePipe.transform(prevStartDate, dateFormat),
      endDate: this.datePipe.transform(prevEndDate, dateFormat)
    });
    const teller = this.tellerForm.value;
    teller.locale = 'en';
    teller.dateFormat = dateFormat;
    this.organizationService.createTeller(teller).subscribe((response: any) => {
      this.router.navigate(['../', response.resourceId], { relativeTo: this.route });
    });
  }

}
