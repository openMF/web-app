/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, Input, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services. */
import { LoansService } from 'app/loans/loans.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { LoanOriginator } from 'app/loans/models/loan-account.model';

/**
 * Attach Loan Originator component.
 */
@Component({
  selector: 'mifosx-attach-originator',
  templateUrl: './attach-originator.component.html',
  styleUrl: './attach-originator.component.scss',
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ]
})
export class AttachOriginatorComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private loanService = inject(LoansService);
  private router = inject(Router);

  /** Attach Loan Originator Loan form. */
  attachLoanOriginatorForm: UntypedFormGroup;
  /** Loan data. */
  loanOriginators: LoanOriginator[] = [];
  @Input() dataObject: any;

  /** Loan Id */
  loanId: string | null = null;

  constructor() {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.setAttachLoanOriginatorForm();
    console.log(this.dataObject);
    this.loanOriginators = [];
    this.dataObject.forEach((loanOriginator: LoanOriginator) => {
      if (loanOriginator.status === 'ACTIVE') {
        this.loanOriginators.push(loanOriginator);
      }
    });
  }

  /**
   * Set Attach Loan Originator form.
   */
  setAttachLoanOriginatorForm() {
    this.attachLoanOriginatorForm = this.formBuilder.group({
      originatorId: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits Approve form.
   */
  submit() {
    const approveLoanFormData = this.attachLoanOriginatorForm.value;
    this.loanService.attachLoanOriginator(this.loanId, approveLoanFormData.originatorId).subscribe((response: any) => {
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }
}
