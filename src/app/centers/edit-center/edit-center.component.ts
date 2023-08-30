/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { CentersService } from '../centers.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Edit Center component.
 */
@Component({
  selector: 'mifosx-edit-center',
  templateUrl: './edit-center.component.html',
  styleUrls: ['./edit-center.component.scss']
})
export class EditCenterComponent implements OnInit {

  /** Center Data */
  centerData: any;
  /** Staffs Data */
  staffs: any;
  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Activate center form. */
  editCenterForm: UntypedFormGroup;

  /**
   * Retrieves the center and template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {CentersService} centerService CentersService.
   * @param {GroupsService} groupService GroupsService.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private centersService: CentersService,
    private settingsService: SettingsService,
    private dateUtils: Dates) {
    this.route.data.subscribe((data: { centerData: any }) => {
      this.centerData = data.centerData;
      this.staffs = this.centerData.staffOptions;
    });
  }

  /**
   * Creates the edit center form.
   */
  ngOnInit(): void {
    this.maxDate = this.settingsService.businessDate;
    this.createEditCenterForm();
  }

  /**
   * Creates the edit center form.
   */
  createEditCenterForm() {
    const dateFormat = this.settingsService.dateFormat;
    this.editCenterForm = this.formBuilder.group({
      'name': [this.centerData.name, [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'staffId': [this.centerData.staffId],
      'externalId': [this.centerData.externalId]
    });
    if (this.centerData.status.value === 'Pending') {
      this.editCenterForm.addControl('activationDate', new UntypedFormControl(this.centerData.activationDate ? this.centerData.activationDate : new Date(), Validators.required));
    }
  }

  /**
   * Submits the form to edit the center data,
   * if successful redirects to the center.
   */
  submit() {
    const editCenterFormData = this.editCenterForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    if (this.centerData.status.value === 'Pending') {
      const prevactivationDate: Date = this.editCenterForm.value.activationDate;
      if (editCenterFormData.activationDate instanceof Date) {
        editCenterFormData.activationDate = this.dateUtils.formatDate(prevactivationDate, dateFormat);
      }
    }
    const data = {
      ...editCenterFormData,
      name: this.centerData.name,
      dateFormat,
      locale
    };
    this.centersService.executeEditCenter(this.centerData.id, data).subscribe(() => {
      this.router.navigate(['../general'], { relativeTo: this.route });
    });
  }

}
