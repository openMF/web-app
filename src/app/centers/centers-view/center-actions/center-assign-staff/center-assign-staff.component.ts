/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { CentersService } from 'app/centers/centers.service';

/**
 * Centers Assign Staff Component
 */
@Component({
  selector: 'mifosx-center-assign-staff',
  templateUrl: './center-assign-staff.component.html',
  styleUrls: ['./center-assign-staff.component.scss']
})
export class CenterAssignStaffComponent implements OnInit {

  /** Center Assign Staff form. */
  centerAssignStaffForm: FormGroup;
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
   */
  constructor(private formBuilder: FormBuilder,
              private centersService: CentersService,
              private route: ActivatedRoute,
              private router: Router) {
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
      'staffId': ['']
    });
  }

  /**
   * Submits the form and assigns staff for the center.
   */
  submit() {
    this.centersService.executeGroupActionCommand(this.centerData.id, 'assignStaff', this.centerAssignStaffForm.value)
      .subscribe(() => {
        this.router.navigate(['../../'], { relativeTo: this.route });
      });
  }

}
