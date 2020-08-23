/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { CentersService } from '../centers.service';
import { SettingsService } from 'app/settings/settings.service';

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
  editCenterForm: FormGroup;

  /**
   * Retrieves the center and template data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {CentersService} centerService CentersService.
   * @param {GroupsService} groupService GroupsService.
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private centersService: CentersService,
    private settingsService: SettingsService,
    private datePipe: DatePipe) {
    this.route.data.subscribe((data: { centerData: any }) => {
      this.centerData = data.centerData;
      this.staffs = this.centerData.staffOptions;
    });
  }

  /**
   * Creates the edit center form.
   */
  ngOnInit(): void {
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
      this.editCenterForm.addControl('activationDate', new FormControl(this.centerData.activationDate ? this.centerData.activationDate : new Date(), Validators.required));
    }
  }

  /**
   * Submits the form to edit the center data,
   * if successful redirects to the center.
   */
  submit() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    if (this.centerData.status.value === 'Pending') {
      const prevactivationDate: Date = this.editCenterForm.value.activationDate;
      this.editCenterForm.patchValue({
        activationDate: this.datePipe.transform(prevactivationDate, dateFormat),
      });
    }
    const data = {
      ...this.editCenterForm.value,
      name: this.centerData.name,
      dateFormat,
      locale
    };
    this.centersService.executeEditCenter(this.centerData.id, data).subscribe(() => {
      this.router.navigate(['../general'], { relativeTo: this.route });
    });
  }

}
