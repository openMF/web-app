/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
/**
 * Create closure component.
 */
@Component({
  selector: 'mifosx-create-closure',
  templateUrl: './create-closure.component.html',
  styleUrls: ['./create-closure.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class CreateClosureComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private accountingService = inject(AccountingService);
  private settingsService = inject(SettingsService);
  private dateUtils = inject(Dates);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  /** Minimum closing date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum closing date allowed. */
  maxDate = new Date();
  /** Accounting closure form. */
  accountingClosureForm: UntypedFormGroup;
  /** Office data. */
  officeData: any;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor() {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Creates the accounting closure form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createAccountingClosureForm();
  }

  /**
   * Creates the accounting closure form.
   */
  createAccountingClosureForm() {
    this.accountingClosureForm = this.formBuilder.group({
      officeId: [
        '',
        Validators.required
      ],
      closingDate: [
        '',
        Validators.required
      ],
      comments: ['']
    });
  }

  /**
   * Submits the accounting closure form and creates accounting closure,
   * if successful redirects to view created closure.
   */
  submit() {
    const accountingClosure = this.accountingClosureForm.value;
    // TODO: Update once language and date settings are setup
    accountingClosure.locale = this.settingsService.language.code;
    accountingClosure.dateFormat = this.settingsService.dateFormat;
    if (accountingClosure.closingDate) {
      accountingClosure.closingDate = this.dateUtils.formatDate(
        accountingClosure.closingDate,
        this.settingsService.dateFormat
      );
    }
    this.accountingService.createAccountingClosure(accountingClosure).subscribe((response: any) => {
      this.router.navigate(
        [
          '../view',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
