import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { Datatables } from 'app/core/utils/datatables';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-datatable-single-row',
  templateUrl: './datatable-single-row.component.html',
  styleUrls: ['./datatable-single-row.component.scss']
})
export class DatatableSingleRowComponent implements OnInit {

  @Input() dataObject: any;
  @Input() entityId: string;
  @Input() entityType: string;
  datatableName: string;

  /**
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dates} dateUtils Date Utils.
   * @param {SystemService} systemService System Service.
   * @param {SettingsService} settingsService Settings Service
   * @param {Datatables} datatables Datatable utils
   */
  constructor(private route: ActivatedRoute,
    private dateUtils: Dates,
    private dialog: MatDialog,
    private settingsService: SettingsService,
    private datatables: Datatables,
    private systemService: SystemService) { }

  ngOnInit() {
    this.route.params.subscribe((routeParams: any) => {
      this.datatableName = routeParams.datatableName;
    });
  }

  add() {
    let dataTableEntryObject: any = {
      locale: this.settingsService.language.code
    };
    const dateTransformColumns: string[] = [];
    const columns = this.datatables.filterSystemColumns(this.dataObject.columnHeaders);
    const formfields: FormfieldBase[] = this.datatables.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    const data = {
      title: 'Add ' + this.datatableName + ' for ' + this.entityType,
      formfields: formfields
    };
    const addDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    addDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.systemService.addEntityDatatableEntry(this.entityId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.systemService.getEntityDatatable(this.entityId, this.datatableName).subscribe((dataObject: any) => {
            this.dataObject = dataObject;
          });
        });
      }
    });
  }

  edit() {
    let dataTableEntryObject: any = {
      locale: this.settingsService.language.code
    };
    const dateTransformColumns: string[] = [];
    const columns = this.datatables.filterSystemColumns(this.dataObject.columnHeaders);
    let formfields: FormfieldBase[] = this.datatables.getFormfields(columns, dateTransformColumns, dataTableEntryObject);
    formfields = formfields.map((formfield: FormfieldBase, index: number) => {
      if (formfield.controlType === 'datepicker') {
        formfield.value = (this.dataObject.data[0].row[columns[index].idx]) ? this.dateUtils.parseDate(this.dataObject.data[0].row[columns[index].idx]) : '';
      } else if (formfield.controlType === 'datetimepicker') {
        formfield.value = (this.dataObject.data[0].row[columns[index].idx]) ? this.dateUtils.parseDatetime(this.dataObject.data[0].row[columns[index].idx]) : '';
      } else {
        formfield.value = (this.dataObject.data[0].row[columns[index].idx]) ? this.dataObject.data[0].row[columns[index].idx] : '';
      }
      return formfield;
    });
    const data = {
      title: 'Edit ' + this.datatableName + ' for ' + this.entityType,
      formfields: formfields,
      layout: {addButtonText: 'Save'}
    };
    const editDialogRef = this.dialog.open(FormDialogComponent, { data, width: '50rem' });
    editDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        dateTransformColumns.forEach((column) => {
          response.data.value[column] = this.dateUtils.formatDate(response.data.value[column], dataTableEntryObject.dateFormat);
        });
        dataTableEntryObject = { ...response.data.value, ...dataTableEntryObject };
        this.systemService.editEntityDatatableEntry(this.entityId, this.datatableName, dataTableEntryObject).subscribe(() => {
          this.systemService.getEntityDatatable(this.entityId, this.datatableName).subscribe((dataObject: any) => {
            this.dataObject = dataObject;
          });
        });
      }
    });
  }

  delete() {
    const deleteDataTableDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: ` the contents of ${this.datatableName}` }
    });
    deleteDataTableDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.systemService.deleteDatatableContent(this.entityId, this.datatableName)
          .subscribe(() => {
            this.systemService.getEntityDatatable(this.entityId, this.datatableName).subscribe((dataObject: any) => {
              this.dataObject = dataObject;
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

  getInputName(attr: string): string {
    return this.datatables.getName(attr);
  }

  isValidUrl(urlString: string): boolean {
    return this.datatables.isValidUrl(urlString);
  }

  openSite(siteUrl: string) {
    window.open(siteUrl, '_blank');
  }

}
