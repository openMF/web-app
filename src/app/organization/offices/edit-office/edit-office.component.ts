/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

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
  officeForm: FormGroup;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

    /**
     * Retrieves the charge data from `resolve`.
     * @param {ProductsService} organizationService Organization Service.
     * @param {FormBuilder} formBuilder Form Builder.
     * @param {ActivatedRoute} route Activated Route.
     * @param {Router} router Router for navigation.
     * @param {MatDialog} dialog Dialog reference.
     * @param {DatePipe} datepipe Convert Date.
     */
    constructor(private organizationService: OrganizationService,
                private formBuilder: FormBuilder,
                private route: ActivatedRoute,
                private router: Router,
                private datepipe: DatePipe) {
      this.route.data.subscribe((data: { officeTemplate: any }) => {
        this.officeData = data.officeTemplate;
      });
    }

  ngOnInit() {
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
    const openedOn: Date = this.officeForm.value.openingDate;
    const dateFormat = 'yyyy-MM-dd';
    this.officeForm.patchValue({
      openingDate: this.datepipe.transform(openedOn, dateFormat)
    });
    const office = this.officeForm.value;
    office.locale = 'en';
    office.dateFormat = dateFormat;
    this.organizationService.updateOffice(this.officeData.id, office).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
