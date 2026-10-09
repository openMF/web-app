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
import { take } from 'rxjs';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Allocate Cash component.
 */
@Component({
  selector: 'mifosx-allocate-cash',
  templateUrl: './allocate-cash.component.html',
  styleUrls: ['./allocate-cash.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AllocateCashComponent implements OnInit {
  private formBuilder = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);
  private organizationService = inject(OrganizationService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier data. */
  cashierData: any;
  /** Cashier Form. */
  allocateCashForm: FormGroup;

  /**
   * Get cashier data from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route ActivateRoute.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {Router} router Router.
   */
  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { cashierTemplate: any }) => {
      this.cashierData = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.setCashierForm();
  }

  /**
   * Set Cashier form.
   */
  setCashierForm() {
    this.allocateCashForm = this.formBuilder.group({
      office: [{ value: this.cashierData.officeName, disabled: true }],
      tellerName: [{ value: this.cashierData.tellerName, disabled: true }],
      cashier: [{ value: this.cashierData.cashierName, disabled: true }],
      assignmentPeriod: [
        {
          value:
            this.dateUtils.formatDate(this.cashierData.startDate, 'dd MMMM yyyy') +
            ' - ' +
            this.dateUtils.formatDate(this.cashierData.endDate, 'dd MMMM yyyy'),
          disabled: true
        }
      ],
      txnDate: [
        new Date(),
        Validators.required
      ],
      currencyCode: [
        '',
        Validators.required
      ],
      txnAmount: [
        '',
        Validators.required
      ],
      txnNote: [
        '',
        Validators.required
      ]
    });
  }

  /**
   * Submits Allocate Cash form.
   */
  submit() {
    const allocateCashFormData = this.allocateCashForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const txnDate = this.allocateCashForm.value.txnDate;
    if (allocateCashFormData.txnDate instanceof Date) {
      allocateCashFormData.txnDate = this.dateUtils.formatDate(txnDate, dateFormat);
    }
    const data = {
      ...allocateCashFormData,
      dateFormat,
      locale
    };
    this.organizationService
      .allocateCash(this.cashierData.tellerId, this.cashierData.cashierId, data)
      .pipe(take(1))
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
