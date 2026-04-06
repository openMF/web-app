/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { Dates } from 'app/core/utils/dates';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanAccountActionsBaseComponent } from '../loan-account-actions-base.component';

@Component({
  selector: 'mifosx-assign-loan-officer',
  templateUrl: './assign-loan-officer.component.html',
  styleUrls: ['./assign-loan-officer.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class AssignLoanOfficerComponent extends LoanAccountActionsBaseComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private dateUtils = inject(Dates);

  loanOfficers: any[];
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Assign loan Officer form. */
  assignOfficerForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   */
  constructor() {
    super();
  }

  /**
   * Creates the assign officer form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createassignOfficerForm();
    this.loanOfficers = this.dataObject.loanOfficerOptions;
  }

  /**
   * Creates the create close form.
   */
  createassignOfficerForm() {
    this.assignOfficerForm = this.formBuilder.group({
      toLoanOfficerId: [
        '',
        Validators.required
      ],
      assignmentDate: [
        new Date(),
        Validators.required
      ]
    });
  }

  submit() {
    const assignOfficerFormData = this.assignOfficerForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const assignmentDate = this.assignOfficerForm.value.assignmentDate;
    if (assignOfficerFormData.assignmentDate instanceof Date) {
      assignOfficerFormData.assignmentDate = this.dateUtils.formatDate(assignmentDate, dateFormat);
    }
    const data = {
      ...assignOfficerFormData,
      dateFormat,
      locale
    };
    data.fromLoanOfficerId = this.dataObject.loanOfficerId || '';
    this.loanService.loanActionButtons(this.loanId, 'assignLoanOfficer', data).subscribe((response: any) => {
      this.gotoLoanDefaultView();
    });
  }
}
