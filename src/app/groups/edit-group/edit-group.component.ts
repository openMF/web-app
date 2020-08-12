/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Custom Services */
import { GroupsService } from '../groups.service';

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
   * @param {DatePipe} datePipe Date Pipe to format date.
   */
  constructor(private formBuilder: FormBuilder,
              private route: ActivatedRoute,
              private router: Router,
              private groupService: GroupsService,
              private datePipe: DatePipe) {
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
    const submittedOnDate: Date = this.editGroupForm.value.submittedOnDate;
    const activationDate: Date = this.editGroupForm.value.activationDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'dd MMMM yyyy';
    this.editGroupForm.patchValue({
      submittedOnDate: this.datePipe.transform(submittedOnDate, dateFormat),
      activationDate: activationDate && this.datePipe.transform(activationDate, dateFormat)
    });
    const group = this.editGroupForm.value;
    group.locale = 'en';
    group.dateFormat = dateFormat;
    this.groupService.updateGroup(group, this.groupData.id).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }

}
