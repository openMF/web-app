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
  selector: 'mifosx-edit-teller',
  templateUrl: './edit-teller.component.html',
  styleUrls: ['./edit-teller.component.scss']
})
export class EditTellerComponent implements OnInit {

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
  /** Teller data. */
  tellerData: any;

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
    this.route.data.subscribe((data: { teller: any, offices: any }) => {
      this.tellerData = data.teller;
      this.officeData = data.offices;
    });

    if (this.tellerData.status) {
      if (this.tellerData.status === 'ACTIVE') {
          this.tellerData.status = 300;
      } else {
          this.tellerData.status = 400;
      }
    }
    this.tellerStatusesData = [ {'id': 300, 'code': '300', 'value': 'Active'},
     {'id': 400, 'code': '400', 'value': 'Inactive'}];
  }

  /**
   * Creates the Edit teller form.
   */
  ngOnInit() {
    this.createEditTellerForm();
  }

  /**
   * Edit teller form.
   */
  createEditTellerForm() {
    this.tellerForm = this.formBuilder.group({
      'officeId': [{value: this.tellerData.officeId, disabled: true}],
      'name': [this.tellerData.name, [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'description': [this.tellerData.description],
      'startDate': [this.tellerData.startDate && new Date(this.tellerData.startDate), Validators.required],
      'endDate': [this.tellerData.endDate && new Date(this.tellerData.endDate)],
      'status': [this.tellerData.status, Validators.required]
    });
  }

  /**
   * Submits the teller form and edits teller,
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
    teller.officeId = this.tellerData.officeId;
    teller.dateFormat = dateFormat;
    this.organizationService.updateTeller(this.tellerData.id, teller).subscribe((response: any) => {
      this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
