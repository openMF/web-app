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
import { FormControl } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from '../../../../../environments/environment';
import { normalizeOfficeTime, officeTimeSeconds } from '../schedules-tab/office-schedule-time';
import { ActivatedRoute } from '@angular/router';

/** Angular Material Imports */
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

/** rxjs Imports */
import { EMPTY, of, Subject, Subscription } from 'rxjs';
import { catchError, finalize, map, distinctUntilChanged, takeUntil, take } from 'rxjs/operators';

/** Custom Components */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { faEllipsisH, faSearch } from '@fortawesome/free-solid-svg-icons';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { TranslateService, _ as extract } from '@ngx-translate/core';
import { OrganizationService } from 'app/organization/organization.service';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

/** Custom Imports */
import { OfficeDetailsSummary } from '../office-details-summary';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

interface DailyInterval {
  start: number;
  end: number;
}

interface ScheduleDay {
  weekday: string;
  enabled: boolean;
  openingTime?: unknown;
  closingTime?: unknown;
}

interface OfficeServiceData {
  officeServiceId?: string | number;
  serviceId?: string | number;
  id?: string | number;
  serviceName?: string;
  serviceExternalId?: string;
  workingHours?: string;
}

@Component({
  selector: 'mifosx-office-services-tab',
  templateUrl: './services-tab.component.html',
  styleUrls: ['./services-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatProgressSpinner,
    MatMenuModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesTabComponent implements OnInit {
  @Input() readOnly = false;

  private authentication = inject(AuthenticationService);
  private summary = inject(OfficeDetailsSummary, { optional: true });
  private route = inject(ActivatedRoute);
  private organizationService = inject(OrganizationService);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  private readonly officeChanged = new Subject<void>();
  private loadRequest?: Subscription;

  officeId: string;
  officeServices: OfficeServiceData[] = [];
  readonly displayedColumns = [
    'serviceName',
    'workingHours',
    'status',
    'actions'
  ];
  readonly hoursUnavailable = extract('branchServices.hoursUnavailable');
  readonly moreIcon = faEllipsisH;
  readonly searchIcon = faSearch;
  readonly scheduleMessages = {
    loading: 'labels.text.Loading data',
    ready: '',
    empty: extract('branchServices.schedule.empty'),
    unavailable: extract('branchServices.schedule.unavailable'),
    invalid: extract('branchServices.schedule.invalid'),
    error: extract('branchServices.schedule.error')
  };
  readonly search = new FormControl('', { nonNullable: true });
  readonly selectedWeekday = new FormControl('MONDAY', { nonNullable: true });
  readonly weekdays = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ];
  scheduleState: 'loading' | 'ready' | 'empty' | 'unavailable' | 'invalid' | 'error' = 'loading';
  scheduleDays: ScheduleDay[] = [];
  private scheduleRequest?: Subscription;
  private dialogOpen = false;
  private activeDialog?: MatDialogRef<any>;

  get canAddService(): boolean {
    return this.canManage('CREATE_OFFICE');
  }
  saveError = false;
  axisStart = 6 * 3600;
  axisEnd = 22 * 3600;
  axisTicks: number[] = [];

  get officeName(): string {
    return this.route.parent.snapshot?.data?.['office']?.name ?? '';
  }

  get filteredServices(): OfficeServiceData[] {
    const query = this.normalizeSearch(this.search.value.trim());
    return query
      ? this.officeServices.filter((service) => [
            service.serviceName,
            service.serviceExternalId,
            service.workingHours
          ].some((value) => this.normalizeSearch(value ?? '').includes(query)))
      : this.officeServices;
  }

  get branchDay(): ScheduleDay | undefined {
    return this.scheduleDays.find((day) => day.weekday === this.selectedWeekday.value);
  }

  get branchHours(): string {
    const day = this.branchDay;
    return day?.enabled ? `${normalizeOfficeTime(day.openingTime)} – ${normalizeOfficeTime(day.closingTime)}` : '';
  }

  get branchInterval(): DailyInterval | null {
    return this.getDailyInterval(this.branchHours);
  }

  get timedServices(): OfficeServiceData[] {
    return this.officeServices.filter((service) => this.getDailyInterval(service.workingHours));
  }

  get unparsedServiceCount(): number {
    return this.officeServices.length - this.timedServices.length;
  }

  barPosition(interval: DailyInterval): { start: number; width: number } {
    return {
      start: ((interval.start - this.axisStart) / (this.axisEnd - this.axisStart)) * 100,
      width: ((interval.end - interval.start) / (this.axisEnd - this.axisStart)) * 100
    };
  }

  axisLabel(seconds: number): string {
    return `${String(Math.floor(seconds / 3600)).padStart(2, '0')}:${String(Math.floor((seconds % 3600) / 60)).padStart(2, '0')}`;
  }

  duration(hours: unknown): string {
    const interval = this.getDailyInterval(hours);
    if (!interval) return '';
    const seconds = interval.end - interval.start;
    const locale = this.translateService.currentLang || 'en-US';
    const parts = [
      new Intl.NumberFormat(locale, { style: 'unit', unit: 'hour', unitDisplay: 'short' }).format(
        Math.floor(seconds / 3600)
      )
    ];
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainder = seconds % 60;
    if (minutes)
      parts.push(
        new Intl.NumberFormat(locale, { style: 'unit', unit: 'minute', unitDisplay: 'short' }).format(minutes)
      );
    if (remainder)
      parts.push(
        new Intl.NumberFormat(locale, { style: 'unit', unit: 'second', unitDisplay: 'short' }).format(remainder)
      );
    return parts.join(' ');
  }

  private normalizeSearch(value: string): string {
    return String(value)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase();
  }

  private updateAxis() {
    const intervals = this.officeServices
      .map((service) => this.getDailyInterval(service.workingHours))
      .filter((interval): interval is DailyInterval => interval !== null);
    if (this.scheduleState === 'ready') {
      for (const day of this.scheduleDays) {
        if (day.enabled)
          intervals.push(
            this.getDailyInterval(`${normalizeOfficeTime(day.openingTime)}–${normalizeOfficeTime(day.closingTime)}`)
          );
      }
    }
    this.axisStart = Math.floor(Math.min(6 * 3600, ...intervals.map((interval) => interval.start)) / 7200) * 7200;
    this.axisEnd = Math.ceil(Math.max(22 * 3600, ...intervals.map((interval) => interval.end)) / 7200) * 7200;
    this.axisTicks = Array.from(
      { length: (this.axisEnd - this.axisStart) / 7200 + 1 },
      (_, index) => this.axisStart + index * 7200
    );
  }

  loadOfficeSchedules() {
    this.scheduleRequest?.unsubscribe();
    this.scheduleDays = [];
    this.scheduleState = 'loading';
    if (!this.officeId) {
      this.scheduleState = 'error';
      return;
    }
    this.scheduleRequest = this.organizationService
      .getOfficeSchedules(this.officeId)
      .pipe(
        map((response) => {
          const days = Array.isArray(response) ? response : response?.days;
          if (!Array.isArray(days) || (response?.officeId != null && String(response.officeId) !== this.officeId)) {
            this.scheduleState = 'invalid';
            return [];
          }
          const seen = new Set<string>();
          const normalized = days.map((day) => ({
            ...day,
            weekday:
              typeof day?.weekday === 'string' ? day.weekday.replace('labels.inputs.', '').trim().toUpperCase() : ''
          }));
          if (
            normalized.some((day) => {
              const invalid =
                !this.weekdays.some((weekday) => weekday.toUpperCase() === day.weekday) ||
                seen.has(day.weekday) ||
                typeof day.enabled !== 'boolean' ||
                (day.enabled &&
                  !this.getDailyInterval(
                    `${normalizeOfficeTime(day.openingTime)}–${normalizeOfficeTime(day.closingTime)}`
                  ));
              seen.add(day.weekday);
              return invalid;
            })
          ) {
            this.scheduleState = 'invalid';
            return [];
          }
          this.scheduleState = days.length ? 'ready' : 'empty';
          return normalized;
        }),
        catchError((error) => {
          this.scheduleState = this.isEndpointNotFound(error) ? 'unavailable' : 'error';
          return of([]);
        }),
        finalize(() => {
          this.updateAxis();
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((days) => {
        this.scheduleDays = days;
      });
  }

  isLoading = true;
  isSaving = false;
  hasError = false;
  isPluginUnavailable = false;

  ngOnInit() {
    this.destroyRef.onDestroy(() => this.activeDialog?.close());
    this.route.parent.paramMap
      .pipe(
        map((params) => params.get('officeId') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((officeId) => {
        const activeDialog = this.activeDialog;
        this.officeChanged.next();
        activeDialog?.close();
        this.activeDialog = undefined;
        this.officeId = officeId;
        this.officeServices = [];
        this.isSaving = false;
        this.dialogOpen = false;
        this.saveError = false;
        this.search.setValue('');
        this.selectedWeekday.setValue('MONDAY');
        this.scheduleDays = [];
        this.loadOfficeServices();
        if (!this.readOnly) this.loadOfficeSchedules();
      });
  }

  loadOfficeServices() {
    this.loadRequest?.unsubscribe();
    this.summary?.serviceCount.set(null);
    this.isLoading = true;
    this.hasError = false;
    this.isPluginUnavailable = false;
    this.saveError = false;

    if (!this.officeId) {
      this.isLoading = false;
      this.hasError = true;
      return;
    }
    this.loadRequest = this.organizationService
      .getOfficeServices(this.officeId)
      .pipe(
        map((services) => {
          if (
            !Array.isArray(services) ||
            services.some((service) => !service || typeof service !== 'object' || Array.isArray(service))
          )
            throw new Error('Invalid services response');
          return services;
        }),
        catchError((error) => {
          if (this.isEndpointNotFound(error)) {
            this.isPluginUnavailable = true;
          } else {
            this.hasError = true;
          }
          return EMPTY;
        }),
        finalize(() => {
          this.updateAxis();
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((services: OfficeServiceData[]) => {
        this.officeServices = Array.isArray(services) ? services : [];
        if (!this.hasError && !this.isPluginUnavailable && Array.isArray(services)) {
          this.summary?.serviceCount.set(this.officeServices.length);
        }
      });
  }

  addService() {
    if (!this.canManage('CREATE_OFFICE')) {
      return;
    }

    const data = {
      title:
        this.translateService.instant('labels.buttons.Add') +
        ' ' +
        this.translateService.instant('labels.heading.Services'),
      formfields: this.getServiceFormFields(),
      layout: { addButtonText: this.translateService.instant('labels.buttons.Submit') }
    };
    this.dialogOpen = true;
    const addServiceDialogRef = this.dialog.open(FormDialogComponent, { data });
    this.activeDialog = addServiceDialogRef;
    addServiceDialogRef
      .afterClosed()
      .pipe(
        take(1),
        finalize(() => {
          this.dialogOpen = false;
          this.activeDialog = undefined;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: any) => {
        if (response?.data) {
          this.saveService(
            this.organizationService.createOfficeService(this.officeId, this.normalizeServiceData(response.data.value))
          );
        }
      });
  }

  editService(service: OfficeServiceData) {
    if (!this.canManage('UPDATE_OFFICE')) {
      return;
    }

    const officeServiceId = this.getOfficeServiceId(service);
    if (!officeServiceId) {
      return;
    }

    const data = {
      title:
        this.translateService.instant('labels.buttons.Edit') +
        ' ' +
        this.translateService.instant('labels.heading.Services'),
      formfields: this.getServiceFormFields(service),
      layout: { addButtonText: this.translateService.instant('labels.buttons.Edit') }
    };
    this.dialogOpen = true;
    const editServiceDialogRef = this.dialog.open(FormDialogComponent, { data });
    this.activeDialog = editServiceDialogRef;
    editServiceDialogRef
      .afterClosed()
      .pipe(
        take(1),
        finalize(() => {
          this.dialogOpen = false;
          this.activeDialog = undefined;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: any) => {
        if (response?.data) {
          this.saveService(
            this.organizationService.updateOfficeService(
              this.officeId,
              officeServiceId,
              this.normalizeServiceData(response.data.value)
            )
          );
        }
      });
  }

  deleteService(service: OfficeServiceData) {
    if (!this.canManage('DELETE_OFFICE')) {
      return;
    }

    const officeServiceId = this.getOfficeServiceId(service);
    if (!officeServiceId) {
      return;
    }

    this.dialogOpen = true;
    const deleteServiceDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.heading.Services') }
    });
    this.activeDialog = deleteServiceDialogRef;
    deleteServiceDialogRef
      .afterClosed()
      .pipe(
        take(1),
        finalize(() => {
          this.dialogOpen = false;
          this.activeDialog = undefined;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((response: any) => {
        if (response?.delete) {
          this.saveService(this.organizationService.deleteOfficeService(this.officeId, officeServiceId));
        }
      });
  }

  getOfficeServiceId(service: OfficeServiceData, index?: number): string {
    const officeServiceId = service?.officeServiceId ?? service?.id ?? service?.serviceId;
    if (officeServiceId === null || officeServiceId === undefined) {
      return index === undefined ? '' : `office-service-${index}`;
    }
    return officeServiceId.toString();
  }

  /** Only a single explicit, increasing 24-hour interval can describe this daily bar. */
  getDailyInterval(value: unknown): DailyInterval | null {
    if (typeof value !== 'string') return null;
    const match = /^(\d{2}:[0-5]\d(?::[0-5]\d)?)\s*[-–]\s*(\d{2}:[0-5]\d(?::[0-5]\d)?)$/.exec(value.trim());
    if (!match) return null;
    const opening = normalizeOfficeTime(match[1]);
    const closing = normalizeOfficeTime(match[2]);
    if (!opening || !closing) return null;
    const start = officeTimeSeconds(opening);
    const end = officeTimeSeconds(closing);
    return start < end ? { start, end } : null;
  }

  private canManage(permission: string): boolean {
    const permissions = this.authentication.getCredentials()?.permissions ?? [];
    return (
      !this.readOnly &&
      !this.isLoading &&
      !this.isSaving &&
      !this.isPluginUnavailable &&
      !this.dialogOpen &&
      (!environment.productionModeEnableRBAC ||
        permissions.includes('ALL_FUNCTIONS') ||
        permissions.includes(permission))
    );
  }

  private saveService(request: any) {
    this.isSaving = true;
    this.saveError = false;
    request
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => this.loadOfficeServices(),
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

  private getServiceFormFields(service?: OfficeServiceData) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'serviceName',
        label: this.translateService.instant('labels.inputs.Service Name'),
        value: service ? service.serviceName : '',
        type: 'text',
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'serviceExternalId',
        label: this.translateService.instant('labels.inputs.External Id'),
        value: service ? service.serviceExternalId : '',
        type: 'text',
        order: 2
      }),
      new InputBase({
        controlName: 'workingHours',
        label: this.translateService.instant('labels.inputs.Working Hours'),
        value: service ? service.workingHours : '',
        type: 'text',
        order: 3
      })
    ];
    return formfields;
  }

  private normalizeServiceData(serviceData: any) {
    return {
      serviceName: serviceData.serviceName ?? '',
      serviceExternalId: serviceData.serviceExternalId ?? '',
      workingHours: serviceData.workingHours ?? ''
    };
  }

  private isEndpointNotFound(error: any): boolean {
    return error?.status === 404 && error?.error?.error === 'Not Found';
  }
}
