/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Datatables } from 'app/core/utils/datatables';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SystemService } from 'app/system/system.service';
import { UsersService } from 'app/users/users.service';
import { NgClass } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatDivider } from '@angular/material/divider';
import { MatCard, MatCardContent } from '@angular/material/card';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslateService } from '@ngx-translate/core';
import { DateFormatPipe } from '../../../../pipes/date-format.pipe';
import { DatetimeFormatPipe } from '../../../../pipes/datetime-format.pipe';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { PrettyPrintPipe } from '../../../../pipes/pretty-print.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { formatDatatableDisplayLabel } from '@pipes/datatable-display-label.pipe';
import { PageLoaderComponent } from 'app/shared/page-loader/page-loader.component';

@Component({
  selector: 'mifosx-datatable-single-row',
  templateUrl: './datatable-single-row.component.html',
  styleUrls: ['./datatable-single-row.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    PageLoaderComponent,
    FaIconComponent,
    MatDivider,
    MatCard,
    MatCardContent,
    NgClass,
    CdkTextareaAutosize,
    MatIconButton,
    MatTooltip,
    DateFormatPipe,
    DatetimeFormatPipe,
    FormatNumberPipe,
    PrettyPrintPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DatatableSingleRowComponent implements OnInit, OnChanges {
  private route = inject(ActivatedRoute);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private dateUtils = inject(Dates);
  private dialog = inject(MatDialog);
  private settingsService = inject(SettingsService);
  public datatables = inject(Datatables);
  private systemService = inject(SystemService);
  private usersService = inject(UsersService);
  private translateService = inject(TranslateService);

  @Input() dataObject: {
    columnHeaders: { columnName: string; columnDisplayType?: string; columnType?: string }[];
    data: { row: any[] }[];
  };
  @Input() entityId: string;
  @Input() entityType: string;
  datatableName: string;
  isLoading = false;
  resolvedUserNames = new Map<number, string>();

  formatTabLabel(label: string): string {
    return this.translateDatatableLabel(label, formatDatatableDisplayLabel(label));
  }

  formatDisplayLabel(label: string): string {
    return this.translateDatatableLabel(label, this.datatables.toDisplayLabel(label));
  }

  getSystemColumnTranslationKey(columnName: string): string | null {
    switch (columnName) {
      case 'created_at':
        return 'labels.inputs.Created At';
      case 'updated_at':
        return 'labels.inputs.Updated At';
      default:
        return null;
    }
  }

  ngOnInit() {
    this.route.params.subscribe((routeParams: any) => {
      this.datatableName = routeParams.datatableName;
      this.changeDetectorRef.markForCheck();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.dataObject) {
      this.resolveUserNames();
      this.changeDetectorRef.markForCheck();
    }
  }

  private resolveUserNames(): void {
    if (!this.dataObject || !this.dataObject.data || !this.dataObject.data[0]) {
      return;
    }
    const row = this.dataObject.data[0].row;

    this.dataObject.columnHeaders.forEach((column: { columnName: string }, index: number) => {
      const lowerName = column.columnName.toLowerCase();
      if (
        lowerName === 'createdby_id' ||
        lowerName === 'created_by_id' ||
        lowerName === 'lastmodifiedby_id' ||
        lowerName === 'last_modified_by_id'
      ) {
        const userId = row[index] as number;
        if (userId && !this.resolvedUserNames.has(userId)) {
          this.usersService.getUser(userId.toString()).subscribe({
            next: (user: { firstname?: string; lastname?: string }) => {
              if (user && user.firstname && user.lastname) {
                this.resolvedUserNames.set(userId, `${user.firstname} ${user.lastname}`);
                this.changeDetectorRef.markForCheck();
              }
            },
            error: (err) => {
              console.warn(`Could not resolve user name for ID ${userId}. Falling back to numeric ID.`, err);
            }
          });
        }
      }
    });
  }

  getResolvedUserName(columnName: string, value: number | null | undefined): string | null {
    if (!value) return null;
    const lowerName = columnName.toLowerCase();
    if (
      lowerName === 'createdby_id' ||
      lowerName === 'created_by_id' ||
      lowerName === 'lastmodifiedby_id' ||
      lowerName === 'last_modified_by_id'
    ) {
      return this.resolvedUserNames.get(value) || null;
    }
    return null;
  }

  add() {
    let dataTableEntryObject: any = {
      locale: this.settingsService.language.code
    };
    const dateTransformColumns: string[] = [];
    const columns = this.datatables.filterSystemColumns(this.dataObject.columnHeaders);
    const formfields: FormfieldBase[] = this.datatables.getFormfields(
      columns,
      dateTransformColumns,
      dataTableEntryObject
    );
    const data = {
      title: this.getAddDialogTitle(),
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(
            response.data.value[column],
            dataTableEntryObject.dateFormat
          );
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.systemService
          .addEntityDatatableEntry(this.entityId, this.datatableName, dataTableEntryObject)
          .subscribe(() => {
            this.isLoading = true;
            this.changeDetectorRef.markForCheck();
            this.systemService.getEntityDatatable(this.entityId, this.datatableName).subscribe((dataObject: any) => {
              this.dataObject = dataObject;
              this.resolveUserNames();
              this.isLoading = false;
              this.changeDetectorRef.markForCheck();
            });
          });
      }
    });
  }

  getAddDialogTitle(): string {
    return `${this.translateService.instant('labels.buttons.Add')} ${this.formatTabLabel(
      this.datatableName
    )} ${this.translateService.instant('labels.text.for')} ${this.getTranslatedEntityType()}`;
  }

  private getTranslatedEntityType(): string {
    const entityTypeKey = `labels.text.${this.entityType}`;
    const translatedEntityType = this.translateService.instant(entityTypeKey);

    return translatedEntityType === entityTypeKey ? this.entityType : translatedEntityType;
  }

  edit() {
    let dataTableEntryObject: any = {
      locale: this.settingsService.language.code
    };
    const dateTransformColumns: string[] = [];
    const columns = this.datatables.filterSystemColumns(this.dataObject.columnHeaders);
    let formfields: FormfieldBase[] = this.datatables.getFormfields(
      columns,
      dateTransformColumns,
      dataTableEntryObject
    );
    formfields = formfields.map((formfield: FormfieldBase, index: number) => {
      if (formfield.controlType === 'datepicker') {
        formfield.value = this.dataObject.data[0].row[columns[index].idx]
          ? this.dateUtils.parseDate(this.dataObject.data[0].row[columns[index].idx])
          : '';
      } else if (formfield.controlType === 'datetimepicker') {
        formfield.value = this.dataObject.data[0].row[columns[index].idx]
          ? this.dateUtils.parseDatetime(this.dataObject.data[0].row[columns[index].idx])
          : '';
      } else {
        formfield.value = this.dataObject.data[0].row[columns[index].idx]
          ? this.dataObject.data[0].row[columns[index].idx]
          : '';
      }
      return formfield;
    });
    const data = {
      title: `${this.translateService.instant('labels.buttons.Edit')} ${this.formatTabLabel(
        this.datatableName
      )} ${this.translateService.instant('labels.text.for')} ${this.getTranslatedEntityType()}`,
      formfields: formfields,
      layout: { addButtonText: 'Submit' },
      pristine: false
    };
    const editDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    editDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(
            response.data.value[column],
            dataTableEntryObject.dateFormat
          );
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.systemService
          .editEntityDatatableEntry(this.entityId, this.datatableName, dataTableEntryObject)
          .subscribe(() => {
            this.isLoading = true;
            this.changeDetectorRef.markForCheck();
            this.systemService.getEntityDatatable(this.entityId, this.datatableName).subscribe((dataObject: any) => {
              this.dataObject = dataObject;
              this.resolveUserNames();
              this.isLoading = false;
              this.changeDetectorRef.markForCheck();
            });
          });
      }
    });
  }

  delete() {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: {
        deleteContext: `${this.translateService.instant('labels.text.the contents of')} ${this.formatTabLabel(
          this.datatableName
        )}`
      }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response?.delete) {
        this.isLoading = true;
        this.changeDetectorRef.markForCheck();
        this.systemService.deleteDatatableContent(this.entityId, this.datatableName).subscribe(() => {
          this.systemService.getEntityDatatable(this.entityId, this.datatableName).subscribe((dataObject: any) => {
            this.dataObject = dataObject;
            this.isLoading = false;
            this.changeDetectorRef.markForCheck();
          });
        });
      }
    });
  }

  setAttributeClass(attr: string): string {
    if (this.datatables.isSystemDefined(attr)) {
      return 'system-defined';
    }
    return 'table-data';
  }

  getColumnType(columnDisplayType: string, columnType: string) {
    if (
      columnType &&
      (columnType.toLowerCase().includes('timestamp') ||
        columnType.toLowerCase() === 'created_at' ||
        columnType.toLowerCase() === 'updated_at')
    ) {
      return 'DATETIME';
    }

    switch (columnDisplayType) {
      case 'DATE': {
        return columnDisplayType;
      }
      case 'DATETIME': {
        return columnDisplayType;
      }
      case 'INTEGER': {
        return columnDisplayType;
      }
      case 'DECIMAL': {
        return columnDisplayType;
      }
      case 'CODELOOKUP': {
        return columnDisplayType;
      }
      case 'BOOLEAN': {
        return columnDisplayType;
      }
      case 'TEXT': {
        if (columnType === 'JSON') {
          return 'JSON';
        } else {
          return columnDisplayType;
        }
      }
      default: {
        return columnDisplayType;
      }
    }
  }

  getInputName(attr: string): string {
    const label = this.datatables.getName(attr);
    return this.translateDatatableLabel(label, this.datatables.toDisplayLabel(label));
  }

  formatValue(value: any): any {
    if (typeof value === 'boolean') {
      return this.translateService.instant(`labels.buttons.${value ? 'Yes' : 'No'}`);
    }

    return value;
  }

  isValidUrl(urlString: string): boolean {
    return this.datatables.isValidUrl(urlString);
  }

  openSite(siteUrl: string) {
    window.open(siteUrl, '_blank', 'noopener,noreferrer');
  }

  private translateDatatableLabel(rawLabel: string, displayLabel: string): string {
    const rawKey = `labels.inputs.${rawLabel}`;
    const translatedRawLabel = this.translateService.instant(rawKey);
    if (translatedRawLabel !== rawKey) {
      return translatedRawLabel;
    }
    const displayKey = `labels.inputs.${displayLabel}`;
    const translatedDisplayLabel = this.translateService.instant(displayKey);
    return translatedDisplayLabel === displayKey ? displayLabel : translatedDisplayLabel;
  }
}
