/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { GroupsService } from '../groups.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/**
 * Edit Group component.
 */
@Component({
  selector: 'mifosx-edit-group',
  templateUrl: './edit-group.component.html',
  styleUrls: ['./edit-group.component.scss']
})
export class EditGroupComponent implements OnInit {

  /** Minimum date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum date allowed. */
  maxDate = new Date();
  /** Edit Group form. */
  editGroupForm: FormGroup;
  /** Staff data. */
  staffData: any;
  /** Group Data */
  groupData: any;
  /** Submitted On Date */
  submittedOnDate: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {GroupsService} groupService GroupsService.
   * @param {Dates} dateUtils Date Utils to format date.
   * @param {SettingsService} settingsService SettingsService
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private groupService: GroupsService,
              private dateUtils: Dates,
              private settingsService: SettingsService) {
    this.route.data.subscribe( (data: { groupAndTemplateData: any, groupViewData: any } ) => {
      this.staffData = data.groupAndTemplateData.staffOptions;
      this.groupData = data.groupAndTemplateData;
      this.submittedOnDate = data.groupViewData.timeline.submittedOnDate && new Date(data.groupViewData.timeline.submittedOnDate);
    });
  }

  /**
   * Creates and sets the edit group form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createEditGroupForm();
    this.editGroupForm.patchValue({
      'name': this.groupData.name,
      'submittedOnDate': this.submittedOnDate,
      'staffId': this.groupData.staffId,
      'externalId': this.groupData.externalId
    });
  }

  /**
   * Creates the edit group form.
   */
  createEditGroupForm() {
    this.editGroupForm = this.formBuilder.group({
      'name': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'submittedOnDate': ['', Validators.required],
      'staffId': [''],
      'externalId': ['']
    });
    this.buildDependencies();
  }

  /**
   * Adds form control Activation Date if group is active.
   */
  buildDependencies() {
    if (this.groupData.active) {
      this.editGroupForm.addControl('activationDate', new FormControl('', Validators.required));
      this.editGroupForm.get('activationDate').patchValue(this.groupData.activationDate && new Date(this.groupData.activationDate));
    } else {
      this.editGroupForm.removeControl('activationDate');
    }
  }

  /**
   * Submits the group form and edits group,
   * if successful redirects to groups.
   */
  submit() {
    const editGroupFormData = this.editGroupForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const submittedOnDate: Date = this.editGroupForm.value.submittedOnDate;
    const activationDate: Date = this.editGroupForm.value.activationDate;
    if (editGroupFormData.submittedOnDate instanceof Date) {
      editGroupFormData.submittedOnDate = this.dateUtils.formatDate(submittedOnDate, dateFormat);
    }
    if (editGroupFormData.activationDate instanceof Date) {
      editGroupFormData.activationDate = this.dateUtils.formatDate(activationDate, dateFormat);
    }
    const data = {
      ...editGroupFormData,
      dateFormat,
      locale
    };
    this.groupService.updateGroup(data, this.groupData.id).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
