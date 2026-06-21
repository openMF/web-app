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
import { FormBuilder, FormGroup, Validators, FormControl, ReactiveFormsModule } from '@angular/forms';
import { take } from 'rxjs';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Dates } from 'app/core/utils/dates';

/** Custom Services. */
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { AlertService } from 'app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * Edit Holiday component.
 */
@Component({
  selector: 'mifosx-edit-holiday',
  templateUrl: './edit-holiday.component.html',
  styleUrls: ['./edit-holiday.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditHolidayComponent implements OnInit {
  private alertService = inject(AlertService);
  private formBuilder = inject(FormBuilder);
  private destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private dateUtils = inject(Dates);
  private organizatioService = inject(OrganizationService);
  private settingsService = inject(SettingsService);
  private router = inject(Router);
  private translateService = inject(TranslateService);

  /** Edit Holiday form. */
  holidayForm: FormGroup;
  /** Holiday data. */
  holidayData: any;
  /** Rescheduling Type. */
  reSchedulingType: number;
  /** Is Active Holiday. */
  isActiveHoliday = true;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  maxDate = new Date(2100, 0, 1);

  /**
   * Get holiday and holiday template from `Resolver`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {OrganizationService} organizatioService Organization Service.
   * @param {Router} router Router.
   */
  constructor() {
    this.route.data
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((data: { holiday: any; holidayTemplate: any }) => {
        this.holidayData = data.holiday;
        this.holidayData.repaymentSchedulingTypes = data.holidayTemplate;
        this.reSchedulingType = this.holidayData.reschedulingType;
        if (this.holidayData.status.value === 'Active') {
          this.isActiveHoliday = true;
        } else {
          this.isActiveHoliday = false;
        }
      });
  }

  ngOnInit() {
    this.maxDate = new Date(2100, 0, 1);
    this.setEditForm();
    if (!this.isActiveHoliday) {
      this.getReschedulingType();
    }
  }

  /**
   * Sets Edit Form.
   */
  setEditForm() {
    this.holidayForm = this.formBuilder.group({
      name: [
        this.holidayData.name,
        Validators.required
      ],
      description: [this.holidayData.description]
    });
    if (!this.isActiveHoliday) {
      this.holidayForm.addControl(
        'fromDate',
        new FormControl(this.holidayData.fromDate && new Date(this.holidayData.fromDate), Validators.required)
      );
      this.holidayForm.addControl(
        'toDate',
        new FormControl(this.holidayData.toDate && new Date(this.holidayData.toDate), Validators.required)
      );
      this.holidayForm.addControl(
        'reschedulingType',
        new FormControl(this.holidayData.reschedulingType, Validators.required)
      );
      if (this.reSchedulingType === 2) {
        this.holidayForm.addControl(
          'repaymentsRescheduledTo',
          new FormControl(
            this.holidayData.repaymentsRescheduledTo && new Date(this.holidayData.repaymentsRescheduledTo),
            Validators.required
          )
        );
      }
    }
  }

  /**
   * Get Rescheduling Type.
   */
  getReschedulingType() {
    this.holidayForm
      .get('reschedulingType')
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((option: any) => {
        this.reSchedulingType = option;
        if (option === 2) {
          this.holidayForm.addControl('repaymentsRescheduledTo', new FormControl(new Date(), Validators.required));
        } else {
          this.holidayForm.removeControl('repaymentsRescheduledTo');
        }
      });
  }

  /**
   * Submits Edit Holiday Form.
   */
  submit() {
    const holidayFormData = this.holidayForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = 'dd MMMM yyyy';
    const momentFormat = 'DD MMMM YYYY';
    const coerceDate = (value: unknown): Date | null => {
      if (value instanceof Date) return value;
      if (value == null || value === '') return null;
      const d = new Date(value as any);
      return Number.isNaN(d.getTime()) ? null : d;
    };
    if (!this.isActiveHoliday) {
      const fromDate = coerceDate(this.holidayForm.value.fromDate);
      const toDate = coerceDate(this.holidayForm.value.toDate);
      if (!fromDate || !toDate) {
        this.alertService.alert({
          type: this.translateService.instant('errors.http.default.title'),
          message: this.translateService.instant('errors.holiday.invalidDate')
        });
        return;
      }
      holidayFormData.fromDate = this.dateUtils.formatDateAsString(fromDate, momentFormat);
      holidayFormData.toDate = this.dateUtils.formatDateAsString(toDate, momentFormat);
      if (this.reSchedulingType === 2) {
        const repaymentsRescheduledTo = coerceDate(this.holidayForm.value.repaymentsRescheduledTo);
        if (!repaymentsRescheduledTo) {
          this.alertService.alert({
            type: this.translateService.instant('errors.http.default.title'),
            message: this.translateService.instant('errors.holiday.invalidRepaymentDate')
          });
          return;
        }
        holidayFormData.repaymentsRescheduledTo = this.dateUtils.formatDateAsString(
          repaymentsRescheduledTo,
          momentFormat
        );
      }
    }
    const data = {
      ...holidayFormData,
      dateFormat,
      locale
    };
    this.organizatioService
      .updateHoliday(this.holidayData.id, data)
      .pipe(take(1))
      .subscribe((response) => {
        /** TODO Add Redirects to ViewMakerCheckerTask page. */
        this.router.navigate(['../'], { relativeTo: this.route });
      });
  }
}
