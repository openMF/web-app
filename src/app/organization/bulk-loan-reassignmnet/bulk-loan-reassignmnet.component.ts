/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { ChangeDetectionStrategy, Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, FormBuilder, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services. */
import { OrganizationService } from '../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Bulk Loan Reassignment component.
 */
@Component({
  selector: 'mifosx-bulk-loan-reassignmnet',
  templateUrl: './bulk-loan-reassignmnet.component.html',
  styleUrls: ['./bulk-loan-reassignmnet.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BulkLoanReassignmnetComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private organizationSevice = inject(OrganizationService);
  private destroyRef = inject(DestroyRef);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private router = inject(Router);

  /** Bulk Loan form. */
  bulkLoanForm: FormGroup;
  /** Office data. */
  offices: any;
  /** To Loan Officers. */
  toLoanOfficers: any[];
  /** From Loan Offices. */
  fromLoanOfficers: any[];
  /** Office Template. */
  officeTemplate: any;
  /** Officer Template. */
  officerTemplate: any;
  /** Loans. */
  loans: any[] = new Array();
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /**
   * Get Office data from `resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {OrganizationService} organizationSevice Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {Router} router Router.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { offices: any }) => {
      this.offices = data.offices;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setBulkLoanForm();
  }

  /**
   * Set Bulk Loan Form.
   */
  setBulkLoanForm() {
    this.bulkLoanForm = this.formBuilder.group({
      officeId: [
        '',
        Validators.required
      ],
      assignmentDate: [
        '',
        Validators.required
      ],
      toLoanOfficerId: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Get Office template.
   * @param officeId Office Id.
   */
  getOffice(officeId: string) {
    this.organizationSevice
      .getOfficeTemplate(officeId)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.officeTemplate = response;
        this.fromLoanOfficers = this.officeTemplate.loanOfficerOptions;
        this.bulkLoanForm.addControl('fromLoanOfficerId', new FormControl('', Validators.required));
      });
  }

  /**
   * Get From Officers.
   * @param officerId Office Id.
   */
  getFromOfficers(officerId: any) {
    this.toLoanOfficers = this.fromLoanOfficers?.filter((officer: any) => officer.id !== officerId) || [];
    if (officerId && this.officeTemplate && this.officeTemplate.officeId) {
      this.organizationSevice
        .getOfficerTemplate(officerId, this.officeTemplate.officeId)
        .pipe(take(1))
        .subscribe((response: any) => {
          this.officerTemplate = response;
        });
    } else {
      this.officerTemplate = undefined;
    }
  }

  /**
   * Get all loans.
   * @param event Mat Checkbox Event.
   * @param loanId Loan Id.
   */
  getLoans(event: any, loanId: any) {
    const isChecked = event.checked;
    if (isChecked) {
      this.loans.push(loanId);
    } else {
      const index = this.loans.indexOf(loanId, 0);
      this.loans.splice(index, 1);
    }
  }

  /**
   * Submits bulk loan reassignment form.
   */
  submit() {
    const { officeId, ...bulkLoanFormData } = this.bulkLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevAssignmentDate = this.bulkLoanForm.value.assignmentDate;
    if (bulkLoanFormData.assignmentDate instanceof Date) {
      bulkLoanFormData.assignmentDate = this.dateUtils.formatDate(prevAssignmentDate, dateFormat);
    }
    const data = {
      ...bulkLoanFormData,
      dateFormat,
      locale
    };
    data.loans = this.loans;
    this.organizationSevice
      .createLoanReassignment(data)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
