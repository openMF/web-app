/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { GroupsService } from '@fineract/client';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Centers Assign Staff Component
 */
@Component({
  selector: 'mifosx-center-assign-staff',
  templateUrl: './center-assign-staff.component.html',
  styleUrls: ['./center-assign-staff.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class CenterAssignStaffComponent implements OnInit {
  /** Center Assign Staff form. */
  centerAssignStaffForm: UntypedFormGroup;
  /** Field Officer Data */
  staffData: any;
  /** Center Data */
  centerData: any;

  /**
   * Fetches Center Action Data from `resolve`
   * @param {FormBuilder} formBuilder Form Builder
   * @param {SavingsService} savingsService Savings Service
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   * @param {GroupsService} groupsService Groups Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private groupsService: GroupsService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.route.data.subscribe((data: { centersActionData: any }) => {
      this.centerData = data.centersActionData;
    });
  }

  /**
   * Creates the center assign staff form.
   */
  ngOnInit() {
    this.staffData = this.centerData.staffOptions;
    this.createCenterAssignStaffForm();
  }

  /**
   * Creates the center assign staff form.
   */
  createCenterAssignStaffForm() {
    this.centerAssignStaffForm = this.formBuilder.group({
      staffId: ['']
    });
  }

  /**
   * Submits the form and assigns staff for the center.
   */
  submit() {
    this.groupsService
      .activateOrGenerateCollectionSheet({
        groupId: this.centerData.id,
        postGroupsGroupIdRequest: this.centerAssignStaffForm.value,
        command: 'assignStaff'
      })
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
