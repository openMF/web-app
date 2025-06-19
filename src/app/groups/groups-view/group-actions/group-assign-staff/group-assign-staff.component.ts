/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatButton } from '@angular/material/button';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

/**
 * Groups Assign Staff Component
 */
@Component({
  selector: 'mifosx-group-assign-staff',
  templateUrl: './group-assign-staff.component.html',
  styleUrls: ['./group-assign-staff.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatCardActions,
    MatButton,
    RouterLink,
    TranslatePipe,
    NgxTranslatePipe
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
      staffId: ['']
    });
  }

  /**
   * Submits the form and assigns staff for the group.
   */
  submit() {
    this.groupsService
      .executeGroupCommand(this.groupData.id, 'assignStaff', this.groupAssignStaffForm.value)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }
}
