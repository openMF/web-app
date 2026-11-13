/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  Input,
  inject
} from '@angular/core';
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
import { EMPTY, Subscription } from 'rxjs';
import { catchError, distinctUntilChanged, finalize, map } from 'rxjs/operators';

/** Custom Components */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

/** Custom Services */
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { normalizeOfficeTime, officeTimeSeconds } from './office-schedule-time';
import { OrganizationService } from 'app/organization/organization.service';

/** Custom Imports */
import { TranslateService } from '@ngx-translate/core';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

interface OfficeScheduleDay {
  weekday: string;
  enabled: boolean;
  openingTime?: unknown;
  closingTime?: unknown;
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
  @Input() readOnly = false;
  private translate = inject(TranslateService);
  private configuredWeekdays = new Set<string>();

  isSummaryDayConfigured(day: AbstractControl): boolean {
    return this.configuredWeekdays.has(day.get('weekday')?.value);
  }

  getShortWeekday(day: AbstractControl): string {
    const index = this.weekdays.findIndex((entry) => entry.weekday === day.get('weekday')?.value);
    try {
      return new Intl.DateTimeFormat(this.translate.currentLang || 'en-US', {
        weekday: 'short',
        timeZone: 'UTC'
      }).format(new Date(Date.UTC(2024, 0, 1 + index)));
    } catch {
      return this.translate.instant(this.getWeekdayLabelKey(day));
    }
  }

  getSummaryHours(day: AbstractControl): string {
    const opening = normalizeOfficeTime(day.get('openingTime')?.value);
    const closing = normalizeOfficeTime(day.get('closingTime')?.value);
    return opening && closing && officeTimeSeconds(opening) < officeTimeSeconds(closing)
      ? `${opening} – ${closing}`
      : '';
  }

  private route = inject(ActivatedRoute);
  private formBuilder: UntypedFormBuilder;

  private authenticationService = inject(AuthenticationService);
  private loadRequest?: Subscription;
  private saveRequest?: Subscription;
  private dayChanges = new Subscription();
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
  schedulesForm: UntypedFormGroup;
  isLoading = true;
  isSaving = false;
  hasError = false;
  saveError = false;
  isPluginUnavailable = false;
  hasNoSchedule = false;

  constructor() {
    this.formBuilder = inject(UntypedFormBuilder);
    this.schedulesForm = this.formBuilder.group({ days: this.formBuilder.array([]) });
  }

  get days(): UntypedFormArray {
    return this.schedulesForm.get('days') as UntypedFormArray;
  }

  get canEdit(): boolean {
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return !this.readOnly && (permissions.includes('ALL_FUNCTIONS') || permissions.includes('UPDATE_OFFICE'));
  }

  get hasIncompleteSchedule(): boolean {
    return this.days.controls.some((day) => this.isDayNotConfigured(day));
  }

  ngOnInit() {
    this.route.parent.paramMap
      .pipe(
        map((params) => params.get('officeId') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((officeId) => {
        // Cancel both operations before resetting state for a different office.
        this.loadRequest?.unsubscribe();
        this.saveRequest?.unsubscribe();
        this.officeId = officeId;
        this.loadOfficeSchedules();
      });
  }

  loadOfficeSchedules() {
    this.loadRequest?.unsubscribe();
    this.isLoading = true;
    this.hasError = false;
    this.saveError = false;
    this.isPluginUnavailable = false;
    this.hasNoSchedule = false;
    this.dayChanges.unsubscribe();
    this.dayChanges = new Subscription();
    this.days.clear();
    this.changeDetectorRef.markForCheck();

    if (!this.officeId) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    this.loadRequest = this.organizationService
      .getOfficeSchedules(this.officeId)
      .pipe(
        map((schedule) => this.normalizeScheduleResponse(schedule)),
        catchError((error) => {
          if (this.isEndpointNotFound(error)) {
            this.isPluginUnavailable = true;
          } else {
            this.hasError = true;
          }
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((days) => {
        this.hasNoSchedule = days.length === 0;
        this.setScheduleDays(days);
      });
  }

  submit() {
    if (!this.canEdit || this.hasError || this.isPluginUnavailable || this.isLoading || this.isSaving) {
      return;
    }

    this.schedulesForm.markAllAsTouched();
    if (this.schedulesForm.invalid) {
      return;
    }

    const payload = this.getSchedulePayload();
    this.isSaving = true;
    this.updateEditableState();
    this.hasError = false;
    this.saveError = false;
    this.isPluginUnavailable = false;

    this.saveRequest = this.organizationService
      .updateOfficeSchedules(this.officeId, payload)
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.updateEditableState();
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
    if (!this.canEdit || this.isSaving || this.isLoading) {
      return;
    }
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
          scheduleDay.openingTime = normalizeOfficeTime(day.openingTime);
          scheduleDay.closingTime = normalizeOfficeTime(day.closingTime);
        }

        return scheduleDay;
      })
    };
  }

  isDayNotConfigured(dayControl: AbstractControl): boolean {
    return (
      !!dayControl.get('enabled')?.value &&
      (!normalizeOfficeTime(dayControl.get('openingTime')?.value) ||
        !normalizeOfficeTime(dayControl.get('closingTime')?.value))
    );
  }

  getWeekdayLabelKey(dayControl: AbstractControl): string {
    return dayControl.get('weekdayLabelKey')?.value ?? '';
  }

  hasTimeRequiredError(dayControl: AbstractControl, controlName: string): boolean {
    const timeControl = dayControl.get(controlName);
    return !!timeControl?.hasError('required') && (timeControl.touched || timeControl.dirty);
  }

  hasInvalidTimeError(dayControl: AbstractControl, controlName: string): boolean {
    const timeControl = dayControl.get(controlName);
    return !!timeControl?.hasError('invalidTime') && (timeControl.touched || timeControl.dirty);
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
    this.configuredWeekdays = new Set(scheduleDays.map((day) => this.normalizeWeekday(day.weekday)));
    this.days.clear();
    this.mergeWeekdays(scheduleDays).forEach((day) => this.days.push(this.createDayForm(day)));
    this.updateEditableState();
  }

  private createDayForm(day: OfficeScheduleDay): UntypedFormGroup {
    const scheduleDay = day as OfficeScheduleWeekday;
    const dayGroup = this.formBuilder.group(
      {
        weekday: [day.weekday],
        weekdayLabelKey: [scheduleDay.labelKey ?? this.getWeekdayLabelKeyFromValue(day.weekday)],
        enabled: [!!day.enabled],
        openingTime: [{ value: normalizeOfficeTime(day.openingTime), disabled: !day.enabled }],
        closingTime: [{ value: normalizeOfficeTime(day.closingTime), disabled: !day.enabled }]
      },
      { validators: this.scheduleDayValidator() }
    );

    this.updateTimeValidators(dayGroup);
    this.dayChanges.add(
      dayGroup
        .get('openingTime')
        .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.refreshClosingTime(dayGroup))
    );
    return dayGroup;
  }

  private updateEditableState() {
    if (!this.canEdit || this.isSaving) {
      this.schedulesForm.disable({ emitEvent: false });
      return;
    }
    this.schedulesForm.enable({ emitEvent: false });
    this.days.controls.forEach((day) => {
      if (!day.get('enabled')?.value) {
        day.get('openingTime')?.disable({ emitEvent: false });
        day.get('closingTime')?.disable({ emitEvent: false });
      }
    });
  }

  private normalizeScheduleResponse(schedule: any): OfficeScheduleDay[] {
    const days = Array.isArray(schedule) ? schedule : schedule?.days;
    // A malformed response must never become an editable empty week.
    if (!Array.isArray(days) || (schedule?.officeId != null && String(schedule.officeId) !== this.officeId)) {
      throw new Error('Invalid office schedule response');
    }
    const weekdays = new Set<string>();
    for (const day of days) {
      const weekday = this.normalizeWeekday(day?.weekday);
      if (
        !this.weekdays.some((entry) => entry.weekday === weekday) ||
        weekdays.has(weekday) ||
        typeof day?.enabled !== 'boolean'
      ) {
        throw new Error('Invalid office schedule day');
      }
      weekdays.add(weekday);
    }
    return days;
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
    return typeof weekday === 'string' ? weekday.replace('labels.inputs.', '').trim().toUpperCase() : '';
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

      const opening = normalizeOfficeTime(openingTime);
      const closing = normalizeOfficeTime(closingTime);
      if (!opening || !closing) {
        return { invalidTime: true };
      }
      return officeTimeSeconds(opening) < officeTimeSeconds(closing) ? null : { timeOrder: true };
    };
  }

  private updateTimeValidators(dayControl: AbstractControl) {
    const enabled = !!dayControl.get('enabled')?.value;
    const openingTime = dayControl.get('openingTime');
    const closingTime = dayControl.get('closingTime');

    openingTime?.setValidators(
      enabled ? [
            Validators.required,
            this.timeValidator()
          ] : []
    );
    closingTime?.setValidators(
      enabled ? [
            Validators.required,
            this.timeValidator(),
            this.closingAfterOpeningValidator()
          ] : []
    );
    openingTime?.updateValueAndValidity({ emitEvent: false });
    closingTime?.updateValueAndValidity({ emitEvent: false });
  }

  private timeValidator(): ValidatorFn {
    return (control) => (!control.value || normalizeOfficeTime(control.value) ? null : { invalidTime: true });
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

      const opening = normalizeOfficeTime(openingTime);
      const closing = normalizeOfficeTime(closingTime);
      if (!opening || !closing) {
        return { invalidTime: true };
      }
      return officeTimeSeconds(opening) < officeTimeSeconds(closing) ? null : { timeOrder: true };
    };
  }

  private isEndpointNotFound(error: any): boolean {
    return error?.status === 404 && error?.error?.error === 'Not Found';
  }
}
