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
 * Edit Cashier component.
 */
@Component({
  selector: 'mifosx-edit-cashier',
  templateUrl: './edit-cashier.component.html',
  styleUrls: ['./edit-cashier.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox
  ]
})
export class EditCashierComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);
  private organizationService = inject(OrganizationService);
  private settingsService = inject(SettingsService);

  /** Cashier Data. */
  cashierData: any = new Object();
  /** Edit cashier form. */
  editCashierForm: UntypedFormGroup;
  /** Is Staff ID present. */
  isStaffId = true;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Hours options for time selection (00-23). */
  hours: string[] = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  /** Minutes options for time selection (00-59). */
  minutes: string[] = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  /**
   *
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor() {
    this.route.data.subscribe((data: { cashier: any; cashierTemplate: any }) => {
      this.cashierData.data = data.cashier;
      this.cashierData.template = data.cashierTemplate;
      this.isStaffId = this.cashierData.template.staffOptions.some(
        (element: any) => element.id === this.cashierData.data.staffId
      );
    });
  }

  ngOnInit() {
    this.maxDate = this.settingsService.maxFutureDate;
    this.setEditCashierForm();
  }

  /**
   * Sets Edit Cashier Form.
   */
  setEditCashierForm() {
    // Extract hours and minutes from existing time data with safe defaults
    const startTime = this.cashierData.data.startTime || '09:00';
    const endTime = this.cashierData.data.endTime || '17:00';
    const [
      hourStart = '09',
      minStart = '00'
    ] = startTime.includes(':') ? startTime.split(':') : [
          '09',
          '00'
        ];
    const [
      hourEnd = '17',
      minEnd = '00'
    ] = endTime.includes(':') ? endTime.split(':') : [
          '17',
          '00'
        ];
    this.editCashierForm = this.formBuilder.group({
      staffId: [{ value: this.cashierData.data.staffId, disabled: true }],
      description: [this.cashierData.data.description],
      startDate: [
        this.cashierData.data.startDate ? new Date(this.cashierData.data.startDate) : null,
        Validators.required
      ],
      endDate: [
        this.cashierData.data.endDate ? new Date(this.cashierData.data.endDate) : null,
        Validators.required
      ],
      isFullDay: [
        this.cashierData.data.isFullDay,
        Validators.required
      ],
      hourStartTime: [hourStart.padStart(2, '0')],
      minStartTime: [minStart.padStart(2, '0')],
      hourEndTime: [hourEnd.padStart(2, '0')],
      minEndTime: [minEnd.padStart(2, '0')]
    });
  }

  /**
   * Submits edit cashier form.
   */
  submit() {
    const editCashierFormData = this.editCashierForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevStartDate: Date = this.editCashierForm.value.startDate;
    const prevEndDate: Date = this.editCashierForm.value.endDate;
    if (editCashierFormData.startDate instanceof Date) {
      editCashierFormData.startDate = this.dateUtils.formatDate(prevStartDate, dateFormat);
    }
    if (editCashierFormData.endDate instanceof Date) {
      editCashierFormData.endDate = this.dateUtils.formatDate(prevEndDate, dateFormat);
    }
    const data: any = {
      staffId: this.cashierData.data.staffId,
      description: editCashierFormData.description,
      startDate: editCashierFormData.startDate,
      endDate: editCashierFormData.endDate,
      isFullDay: editCashierFormData.isFullDay,
      dateFormat,
      locale
    };
    // Clear stale time-range errors before re-validating
    if (this.editCashierForm.hasError('invalidTimeRange')) {
      const { invalidTimeRange, ...rest } = this.editCashierForm.errors ?? {};
      this.editCashierForm.setErrors(Object.keys(rest).length ? rest : null);
    }
    // Add time fields only when not full day
    if (!editCashierFormData.isFullDay) {
      const hourStart = editCashierFormData.hourStartTime;
      const minStart = editCashierFormData.minStartTime;
      const hourEnd = editCashierFormData.hourEndTime;
      const minEnd = editCashierFormData.minEndTime;
      // Validate that end time is after start time
      const startMinutes = Number(hourStart) * 60 + Number(minStart);
      const endMinutes = Number(hourEnd) * 60 + Number(minEnd);
      if (Number.isNaN(startMinutes) || Number.isNaN(endMinutes) || endMinutes <= startMinutes) {
        this.editCashierForm.setErrors({ invalidTimeRange: true });
        return;
      }
      data.hourStartTime = hourStart;
      data.minStartTime = minStart;
      data.hourEndTime = hourEnd;
      data.minEndTime = minEnd;
      data.startTime = `${hourStart}:${minStart}`;
      data.endTime = `${hourEnd}:${minEnd}`;
    }
    this.organizationService
      .updateCashier(this.cashierData.data.tellerId, this.cashierData.data.id, data)
      .subscribe((response: any) => {
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
