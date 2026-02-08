/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports. */
import { Component, OnInit, inject } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Create Cashier component.
 */
@Component({
  selector: 'mifosx-create-cashier',
  templateUrl: './create-cashier.component.html',
  styleUrls: ['./create-cashier.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ]
})
export class CreateCashierComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);
  private organizationService = inject(OrganizationService);
  private settingsService = inject(SettingsService);

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Cashier Template. */
  cashierTemplate: any;
  /** Create cashier form. */
  createCashierForm: UntypedFormGroup;
  /** Hours options for time selection (00-23). */
  hours: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  /** Minutes options for time selection (00-59). */
  minutes: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  /**
   * Fetches cashier template from `resolve`
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor() {
    this.route.data.subscribe((data: { cashierTemplate: any }) => {
      this.cashierTemplate = data.cashierTemplate;
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.setCreateCashierForm();
  }

  /**
   * Sets Create Charge Form.
   */
  setCreateCashierForm() {
    this.createCashierForm = this.formBuilder.group({
      staffId: [
        '',
        Validators.required
      ],
      description: [''],
      startDate: [
        '',
        Validators.required
      ],
      endDate: [
        '',
        Validators.required
      ],
      isFullDay: [true],
      hourStartTime: ['00'],
      minStartTime: ['00'],
      hourEndTime: ['00'],
      minEndTime: ['00']
    });
  }

  /**
   * Submits Create cashier form.
   */
  submit() {
    const createCashierFormData = this.createCashierForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.createCashierForm.value.startDate;
    const prevEndDate: Date = this.createCashierForm.value.endDate;
    if (createCashierFormData.startDate instanceof Date) {
      createCashierFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (createCashierFormData.endDate instanceof Date) {
      createCashierFormData.endDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    const data: any = {
      staffId: createCashierFormData.staffId,
      description: createCashierFormData.description,
      startDate: createCashierFormData.startDate,
      endDate: createCashierFormData.endDate,
      isFullDay: createCashierFormData.isFullDay,
      dateFormat,
      locale
    };
    // Clear stale time-range errors before re-validating
    if (this.createCashierForm.hasError('invalidTimeRange')) {
      const { invalidTimeRange, ...rest } = this.createCashierForm.errors ?? {};
      this.createCashierForm.setErrors(Object.keys(rest).length ? rest : null);
    }
    // Add time fields only when not full day
    if (!createCashierFormData.isFullDay) {
      const hourStart = createCashierFormData.hourStartTime;
      const minStart = createCashierFormData.minStartTime;
      const hourEnd = createCashierFormData.hourEndTime;
      const minEnd = createCashierFormData.minEndTime;
      // Validate that end time is after start time
      const startMinutes = Number(hourStart) * 60 + Number(minStart);
      const endMinutes = Number(hourEnd) * 60 + Number(minEnd);
      if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || endMinutes <= startMinutes) {
        this.createCashierForm.setErrors({ invalidTimeRange: true });
        return;
      }
      data.hourStartTime = hourStart;
      data.minStartTime = minStart;
      data.hourEndTime = hourEnd;
      data.minEndTime = minEnd;
      data.startTime = `${hourStart}:${minStart}`;
      data.endTime = `${hourEnd}:${minEnd}`;
    }
    this.organizationService.createCashier(this.cashierTemplate.tellerId, data).subscribe((response: any) => {
      this.router.navigate(['../'], { relativeTo: this.route });
    });
  }
}
