/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Create Office component.
 */
@Component({
  selector: 'mifosx-create-office',
  templateUrl: './create-office.component.html',
  styleUrls: ['./create-office.component.scss']
})
export class CreateOfficeComponent implements OnInit {

  /** Office form. */
  officeForm: FormGroup;
  /** Office Data */
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
              private settingsService: SettingsService,
              private router: Router,
              private route: ActivatedRoute,
              private datePipe: DatePipe) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.createofficeForm();
  }

  /**
   * Creates the Office Form
   */
  createofficeForm() {
    this.officeForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'parentId': ['', Validators.required],
      'openingDate': ['', Validators.required],
      'externalId': [''],
    });
  }

  /**
   * Submits the office form and creates office.
   * if successful redirects to offices
   */
  submit() {
    const prevOpeningDate: Date = this.officeForm.value.openingDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = this.settingsService.dateFormat;
    this.officeForm.patchValue({
      openingDate: this.datePipe.transform(prevOpeningDate, dateFormat)
    });
    const office = this.officeForm.value;
    office.locale = this.settingsService.language.code;
    office.dateFormat = dateFormat;
    this.organizationService.createOffice(office).subscribe(response => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
