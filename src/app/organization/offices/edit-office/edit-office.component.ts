/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Edit Office component.
 */
@Component({
  selector: 'mifosx-edit-office',
  templateUrl: './edit-office.component.html',
  styleUrls: ['./edit-office.component.scss']
})
export class EditOfficeComponent implements OnInit {

  /** Selected Data. */
  officeData: any;
  /** Office form. */
  officeForm: UntypedFormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

    /**
     * Retrieves the charge data from `resolve`.
     * @param {ProductsService} organizationService Organization Service.
     * @param {SettingsService} settingsService Settings Service.
     * @param {FormBuilder} formBuilder Form Builder.
     * @param {ActivatedRoute} route Activated Route.
     * @param {Router} router Router for navigation.
     * @param {MatDialog} dialog Dialog reference.
     * @param {Dates} dateUtils Date Utils
     */
    constructor(private organizationService: OrganizationService,
                private settingsService: SettingsService,
                private formBuilder: UntypedFormBuilder,
                private route: ActivatedRoute,
                private router: Router,
                private dateUtils: Dates) {
      this.route.data.subscribe((data: { officeTemplate: any }) => {
        this.officeData = data.officeTemplate;
      });
    }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createOfficeForm();
  }

  /**
   * Create Edit Office Form.
   */
  createOfficeForm() {
    this.officeForm = this.formBuilder.group({
      'name': [this.officeData.name, Validators.required],
      'openingDate': [this.officeData.openingDate && new Date(this.officeData.openingDate), Validators.required],
      'externalId': [this.officeData.externalId],
    });
    if (this.officeData.allowedParents.length) {
      this.officeForm.addControl('parentId', this.formBuilder.control(this.officeData.parentId, Validators.required));
    }
  }

  /**
   * Submits the edit office form.
   */
  submit() {
    const officeFormData = this.officeForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevOpenedOn: Date = this.officeForm.value.openingDate;
    if (officeFormData.openingDate instanceof Date) {
      officeFormData.openingDate = this.dateUtils.formatDate(prevOpenedOn, dateFormat);
    }
    const data = {
      ...officeFormData,
      dateFormat,
      locale
    };
    this.organizationService.updateOffice(this.officeData.id, data).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
