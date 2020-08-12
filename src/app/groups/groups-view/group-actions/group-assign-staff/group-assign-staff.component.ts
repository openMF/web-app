/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';

/**
 * Groups Assign Staff Component
 */
@Component({
  selector: 'mifosx-group-assign-staff',
  templateUrl: './group-assign-staff.component.html',
  styleUrls: ['./group-assign-staff.component.scss']
})
export class GroupAssignStaffComponent implements OnInit {

  /** Group Assign Staff form. */
  groupAssignStaffForm: FormGroup;
  /** Staff Data */
  staffData: any;
  /** Group Data */
  groupData: any;

  /**
   * Fetches Group Action Data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private formBuilder: FormBuilder,
              private groupsService: GroupsService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      this.groupData = data.groupActionData;
    });
  }

  ngOnInit() {
    this.staffData = this.groupData.staffOptions;
    this.createGroupAssignStaffForm();
  }

  /**
   * Creates the group assign staff form.
   */
  createGroupAssignStaffForm() {
    this.groupAssignStaffForm = this.formBuilder.group({
      'staffId': ['']
    });
  }

  /**
   * Submits the form and assigns staff for the group.
   */
  submit() {
    this.groupsService.executeGroupCommand(this.groupData.id, 'assignStaff', this.groupAssignStaffForm.value)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

}
