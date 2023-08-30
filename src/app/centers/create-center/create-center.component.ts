/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { CentersService } from '../centers.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Create Center component.
 */
@Component({
  selector: 'mifosx-create-center',
  templateUrl: './create-center.component.html',
  styleUrls: ['./create-center.component.scss']
})
export class CreateCenterComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Center form. */
  centerForm: UntypedFormGroup;
  /** Office data. */
  officeData: any;
  /** Group data. */
  groupsData: any;
  /** Staff data. */
  staffData: any;
  /** Group Members. */
  groupMembers: any[] = [];
  /** Group Choice. */
  groupChoice = new UntypedFormControl('');

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {CentersService} centerService CentersService.
   * @param {SettingsService} settingsService Settings Service.
   * @param {GroupsService} groupService GroupsService.
   * @param {Dates} dateUtils Date Utils to format date.
   */
  constructor(private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private centerService: CentersService,
    private settingsService: SettingsService,
    private groupService: GroupsService,
    private dateUtils: Dates) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Creates and sets the center form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createCenterForm();
  }

  /**
   * Creates the center form.
   */
  createCenterForm() {
    this.centerForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'officeId': ['', Validators.required],
      'submittedOnDate': ['', Validators.required],
      'staffId': [''],
      'externalId': [''],
      'active': [''],
    });
    this.buildDependencies();
  }

  /**
   * Sets the staff and groups data each time the user selects a new office.
   * Adds form control Activation Date if active.
   */
  buildDependencies() {
    this.centerForm.get('officeId').valueChanges.subscribe((option: any) => {
      this.groupService.getGroupsByOfficeId(option).subscribe((data: any) => {
        this.groupsData = data;
        if (!this.groupsData.length) {
          this.groupChoice.disable();
        } else {
          this.groupChoice.enable();
        }
      });
      this.centerService.getStaff(option).subscribe((data: any) => {
        this.staffData = data['staffOptions'];
        if (this.staffData === undefined) {
          this.centerForm.controls['staffId'].disable();
        } else {
          this.centerForm.controls['staffId'].enable();
        }
      });
    });
    this.centerForm.get('active').valueChanges.subscribe((bool: boolean) => {
      if (bool) {
        this.centerForm.addControl('activationDate', new UntypedFormControl('', Validators.required));
      } else {
        this.centerForm.removeControl('activationDate');
      }
    });
  }

  /**
   * Add group.
   */
  addGroup() {
    if (!this.groupMembers.includes(this.groupChoice.value)) {
      this.groupMembers.push(this.groupChoice.value);
    }
  }

  /**
   * Remove group.
   */
  removeGroup(index: number) {
    this.groupMembers.splice(index, 1);
  }

  /**
   * Submits the center form and creates center,
   * if successful redirects to centers.
   */
  submit() {
    const centerFormData = this.centerForm.value;
    const prevSubmittedOnDate: Date = this.centerForm.value.submittedOnDate;
    const prevActivationDate: Date = this.centerForm.value.activationDate;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    if (centerFormData.submittedOnDate instanceof Date) {
      centerFormData.submittedOnDate = this.dateUtils.formatDate(prevSubmittedOnDate, dateFormat);
    }
    if (centerFormData.activationDate instanceof Date) {
      centerFormData.activationDate = this.dateUtils.formatDate(prevActivationDate, dateFormat);
    }
    const data = {
      ...centerFormData,
      dateFormat,
      locale
    };
    data.groupMembers = [];
    this.groupMembers.forEach((group: any) => data.groupMembers.push(group.id));
    this.centerService.createCenter(data).subscribe((response: any) => {
      this.router.navigate(['../centers']);
    });
  }

}
