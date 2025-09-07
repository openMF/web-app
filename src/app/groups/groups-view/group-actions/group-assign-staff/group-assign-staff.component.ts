/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { GroupsService } from '@fineract/client';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Groups Assign Staff Component
 */
@Component({
  selector: 'mifosx-group-assign-staff',
  templateUrl: './group-assign-staff.component.html',
  styleUrls: ['./group-assign-staff.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class GroupAssignStaffComponent implements OnInit {
  /** Group Assign Staff form. */
  groupAssignStaffForm: UntypedFormGroup;
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
  constructor(
    private formBuilder: UntypedFormBuilder,
    private groupsService: GroupsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      console.log('Group action data:', data.groupActionData);
      this.groupData = data.groupActionData;
    });
  }

  ngOnInit() {
    console.log('Group data:', this.groupData);

    // Make sure staffOptions exists before accessing it
    if (this.groupData && this.groupData.staffOptions) {
      this.staffData = this.groupData.staffOptions;
      console.log('Staff options:', this.staffData);
    } else {
      console.error('No staff options found in group data');

      // As a fallback, try to get staff options from the template property
      if (this.groupData && this.groupData.template && this.groupData.template.staffOptions) {
        this.staffData = this.groupData.template.staffOptions;
        console.log('Staff options from template:', this.staffData);
      } else {
        this.staffData = [];
      }
    }

    this.createGroupAssignStaffForm();
  }

  /**
   * Creates the group assign staff form.
   */
  createGroupAssignStaffForm() {
    this.groupAssignStaffForm = this.formBuilder.group({
      staffId: ['']
    });
  }

  /**
   * Submits the form and assigns staff for the group.
   */
  submit() {
    this.groupsService
      .activateOrGenerateCollectionSheet({
        groupId: this.groupData.id,
        command: 'assignStaff',
        ...this.groupAssignStaffForm.value
      })
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
