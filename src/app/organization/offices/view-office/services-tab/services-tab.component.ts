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
import { ActivatedRoute } from '@angular/router';

/** Angular Material Imports */
import { MatDialog } from '@angular/material/dialog';
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
import { MatTooltip } from '@angular/material/tooltip';

/** rxjs Imports */
import { of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';

/** Custom Components */
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { TranslateService } from '@ngx-translate/core';
import { OrganizationService } from 'app/organization/organization.service';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

/** Custom Imports */
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
    MatTooltip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ServicesTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private organizationService = inject(OrganizationService);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  officeId: string;
  officeServices: OfficeServiceData[] = [];
  displayedColumns: string[] = [
    'serviceName',
    'serviceExternalId',
    'workingHours',
    'actions'
  ];
  isLoading = true;
  isSaving = false;
  hasError = false;
  isPluginUnavailable = false;

  ngOnInit() {
    this.officeId = this.route.parent.snapshot.paramMap.get('officeId') ?? '';
    this.loadOfficeServices();
  }

  loadOfficeServices() {
    this.isLoading = true;
    this.hasError = false;
    this.isPluginUnavailable = false;

    this.organizationService
      .getOfficeServices(this.officeId)
      .pipe(
        catchError((error) => {
          if (this.isEndpointNotFound(error)) {
            this.isPluginUnavailable = true;
          } else {
            this.hasError = true;
          }
          return of([]);
        }),
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((services: OfficeServiceData[]) => {
        this.officeServices = Array.isArray(services) ? services : [];
      });
  }

  addService() {
    if (this.isPluginUnavailable) {
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
    const addServiceDialogRef = this.dialog.open(FormDialogComponent, { data });
    addServiceDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.data) {
        this.saveService(
          this.organizationService.createOfficeService(this.officeId, this.normalizeServiceData(response.data.value))
        );
      }
    });
  }

  editService(service: OfficeServiceData) {
    if (this.isPluginUnavailable) {
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
    const editServiceDialogRef = this.dialog.open(FormDialogComponent, { data });
    editServiceDialogRef.afterClosed().subscribe((response: any) => {
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
    if (this.isPluginUnavailable) {
      return;
    }

    const officeServiceId = this.getOfficeServiceId(service);
    if (!officeServiceId) {
      return;
    }

    const deleteServiceDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.heading.Services') }
    });
    deleteServiceDialogRef.afterClosed().subscribe((response: any) => {
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

  private saveService(request: any) {
    this.isSaving = true;
    this.hasError = false;
    this.isPluginUnavailable = false;
    request
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: () => this.loadOfficeServices(),
        error: (error: any) => {
          if (this.isEndpointNotFound(error)) {
            this.isPluginUnavailable = true;
            this.officeServices = [];
          } else {
            this.hasError = true;
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
