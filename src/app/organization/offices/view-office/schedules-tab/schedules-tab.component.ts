/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  AbstractControl,
  UntypedFormArray,
  UntypedFormBuilder,
  UntypedFormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Angular Material Imports */
import { MatProgressSpinner } from '@angular/material/progress-spinner';

/** rxjs Imports */
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

/** Custom Components */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Custom Services */
import { OrganizationService } from 'app/organization/organization.service';

/** Custom Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

interface OfficeScheduleDay {
  weekday: string;
  enabled: boolean;
  openingTime?: string | null;
  closingTime?: string | null;
}

interface OfficeScheduleWeekday extends OfficeScheduleDay {
  labelKey: string;
}

@Component({
  selector: 'mifosx-office-schedules-tab',
  templateUrl: './schedules-tab.component.html',
  styleUrls: ['./schedules-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatProgressSpinner
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SchedulesTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private formBuilder = inject(UntypedFormBuilder);
  private organizationService = inject(OrganizationService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  readonly weekdays: OfficeScheduleWeekday[] = [
    { weekday: 'MONDAY', labelKey: 'labels.inputs.Monday', enabled: false },
    { weekday: 'TUESDAY', labelKey: 'labels.inputs.Tuesday', enabled: false },
    { weekday: 'WEDNESDAY', labelKey: 'labels.inputs.Wednesday', enabled: false },
    { weekday: 'THURSDAY', labelKey: 'labels.inputs.Thursday', enabled: false },
    { weekday: 'FRIDAY', labelKey: 'labels.inputs.Friday', enabled: false },
    { weekday: 'SATURDAY', labelKey: 'labels.inputs.Saturday', enabled: false },
    { weekday: 'SUNDAY', labelKey: 'labels.inputs.Sunday', enabled: false }
  ];

  officeId: string;
  schedulesForm = this.formBuilder.group({
    days: this.formBuilder.array([])
  });
  isLoading = true;
  isSaving = false;
  hasError = false;
  saveError = false;
  isPluginUnavailable = false;

  get days(): UntypedFormArray {
    return this.schedulesForm.get('days') as UntypedFormArray;
  }

  ngOnInit() {
    this.officeId = this.route.parent.snapshot.paramMap.get('officeId') ?? '';
    this.loadOfficeSchedules();
  }

  loadOfficeSchedules() {
    this.isLoading = true;
    this.hasError = false;
    this.saveError = false;
    this.isPluginUnavailable = false;

    this.organizationService
      .getOfficeSchedules(this.officeId)
      .pipe(
        catchError((error) => {
          if (this.isEndpointNotFound(error)) {
            this.isPluginUnavailable = true;
          } else {
            this.hasError = true;
          }
          return of({ days: [] });
        }),
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((schedule: any) => {
        this.setScheduleDays(this.normalizeScheduleResponse(schedule));
      });
  }

  submit() {
    if (this.isPluginUnavailable || this.isLoading || this.isSaving) {
      return;
    }

    this.schedulesForm.markAllAsTouched();
    if (this.schedulesForm.invalid) {
      return;
    }

    this.isSaving = true;
    this.hasError = false;
    this.saveError = false;
    this.isPluginUnavailable = false;

    this.organizationService
      .updateOfficeSchedules(this.officeId, this.getSchedulePayload())
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => this.loadOfficeSchedules(),
        error: (error: any) => {
          if (this.isEndpointNotFound(error)) {
            this.isPluginUnavailable = true;
          } else {
            this.saveError = true;
          }
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  setDayEnabled(dayControl: AbstractControl, enabled: boolean) {
    const openingTime = dayControl.get('openingTime');
    const closingTime = dayControl.get('closingTime');

    if (enabled) {
      openingTime?.enable();
      closingTime?.enable();
    } else {
      openingTime?.reset('');
      closingTime?.reset('');
      openingTime?.disable();
      closingTime?.disable();
    }

    this.updateTimeValidators(dayControl);
    dayControl.updateValueAndValidity();
    this.changeDetectorRef.markForCheck();
  }

  getSchedulePayload() {
    return {
      days: this.days.getRawValue().map((day: OfficeScheduleDay) => {
        const scheduleDay: OfficeScheduleDay = {
          weekday: day.weekday,
          enabled: !!day.enabled
        };

        if (scheduleDay.enabled) {
          scheduleDay.openingTime = day.openingTime;
          scheduleDay.closingTime = day.closingTime;
        }

        return scheduleDay;
      })
    };
  }

  getWeekdayLabelKey(dayControl: AbstractControl): string {
    return dayControl.get('weekdayLabelKey')?.value ?? '';
  }

  hasTimeRequiredError(dayControl: AbstractControl, controlName: string): boolean {
    const timeControl = dayControl.get(controlName);
    return !!timeControl?.hasError('required') && (timeControl.touched || timeControl.dirty);
  }

  hasTimeOrderError(dayControl: AbstractControl): boolean {
    const closingTime = dayControl.get('closingTime');
    return !!closingTime?.hasError('timeOrder') && (closingTime.touched || closingTime.dirty);
  }

  refreshClosingTime(dayControl: AbstractControl) {
    dayControl.get('closingTime')?.updateValueAndValidity();
    dayControl.updateValueAndValidity();
  }

  private setScheduleDays(scheduleDays: OfficeScheduleDay[]) {
    this.days.clear();
    this.mergeWeekdays(scheduleDays).forEach((day) => this.days.push(this.createDayForm(day)));
  }

  private createDayForm(day: OfficeScheduleDay): UntypedFormGroup {
    const scheduleDay = day as OfficeScheduleWeekday;
    const dayGroup = this.formBuilder.group(
      {
        weekday: [day.weekday],
        weekdayLabelKey: [scheduleDay.labelKey ?? this.getWeekdayLabelKeyFromValue(day.weekday)],
        enabled: [!!day.enabled],
        openingTime: [{ value: day.openingTime ?? '', disabled: !day.enabled }],
        closingTime: [{ value: day.closingTime ?? '', disabled: !day.enabled }]
      },
      { validators: this.scheduleDayValidator() }
    );

    this.updateTimeValidators(dayGroup);
    return dayGroup;
  }

  private normalizeScheduleResponse(schedule: any): OfficeScheduleDay[] {
    const days = Array.isArray(schedule) ? schedule : schedule?.days;
    return Array.isArray(days) ? days : [];
  }

  private mergeWeekdays(scheduleDays: OfficeScheduleDay[]): OfficeScheduleWeekday[] {
    return this.weekdays.map((weekday) => {
      const scheduleDay = scheduleDays.find((day) => this.normalizeWeekday(day?.weekday) === weekday.weekday);

      return {
        weekday: weekday.weekday,
        labelKey: weekday.labelKey,
        enabled: !!scheduleDay?.enabled,
        openingTime: scheduleDay?.openingTime ?? '',
        closingTime: scheduleDay?.closingTime ?? ''
      };
    });
  }

  private getWeekdayLabelKeyFromValue(weekday: string): string {
    return this.weekdays.find((day) => day.weekday === this.normalizeWeekday(weekday))?.labelKey ?? '';
  }

  private normalizeWeekday(weekday: string): string {
    return weekday?.replace('labels.inputs.', '').toUpperCase();
  }

  private scheduleDayValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const enabled = !!control.get('enabled')?.value;
      const openingTime = control.get('openingTime')?.value;
      const closingTime = control.get('closingTime')?.value;

      if (!enabled) {
        return null;
      }

      if (!openingTime || !closingTime) {
        return { timesRequired: true };
      }

      return openingTime < closingTime ? null : { timeOrder: true };
    };
  }

  private updateTimeValidators(dayControl: AbstractControl) {
    const enabled = !!dayControl.get('enabled')?.value;
    const openingTime = dayControl.get('openingTime');
    const closingTime = dayControl.get('closingTime');

    openingTime?.setValidators(enabled ? [Validators.required] : []);
    closingTime?.setValidators(
      enabled ? [
            Validators.required,
            this.closingAfterOpeningValidator()
          ] : []
    );
    openingTime?.updateValueAndValidity({ emitEvent: false });
    closingTime?.updateValueAndValidity({ emitEvent: false });
  }

  private closingAfterOpeningValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const dayControl = control.parent;
      const enabled = !!dayControl?.get('enabled')?.value;
      const openingTime = dayControl?.get('openingTime')?.value;
      const closingTime = control.value;

      if (!enabled || !openingTime || !closingTime) {
        return null;
      }

      return openingTime < closingTime ? null : { timeOrder: true };
    };
  }

  private isEndpointNotFound(error: any): boolean {
    return error?.status === 404 && error?.error?.error === 'Not Found';
  }
}
