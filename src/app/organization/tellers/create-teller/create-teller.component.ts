/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/**
 * Create Create Teller component.
 */
@Component({
  selector: 'mifosx-create-teller',
  templateUrl: './create-teller.component.html',
  styleUrls: ['./create-teller.component.scss']
})
export class CreateTellerComponent implements OnInit {

  /** Teller Form */
  tellerForm: FormGroup;
  /** Office data. */
  officeData: any;
   /** Minimum Date allowed. */
   minDate = new Date(2000, 0, 1);
   /** Maximum Date allowed. */
   maxDate = new Date();

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
  }

  ngOnInit() {
    this.createtellerForm();
  }

  /**
   * Creates Teller Form.
   */
  createtellerForm() {
    this.tellerForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'officeId': ['', Validators.required],
      'description': [''],
      'startDate': ['', Validators.required],
      'endDate': [''],
      'status': ['']
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
    this.organizationService.createTeller(teller).subscribe(response => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
