/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

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
  tellerForm: UntypedFormGroup;
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
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private organizationService: OrganizationService,
              private settingsService: SettingsService,
              private route: ActivatedRoute,
              private router: Router,
              private dateUtils: Dates) {
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
    this.maxDate = this.settingsService.maxFutureDate;
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
    const tellerFormData = this.tellerForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.tellerForm.value.startDate;
    const prevEndDate: Date = this.tellerForm.value.endDate;
    if (tellerFormData.startDate instanceof Date) {
      tellerFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (tellerFormData.endDate instanceof Date) {
      tellerFormData.endDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    const data = {
      ...tellerFormData,
      officeId: this.tellerData.officeId,
      dateFormat,
      locale
    };
    this.organizationService.updateTeller(this.tellerData.id, data).subscribe((response: any) => {
      this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
