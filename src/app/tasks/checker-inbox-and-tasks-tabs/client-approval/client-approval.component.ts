/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import * as _ from 'lodash';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Imports */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { DatepickerBase } from 'app/shared/form-dialog/formfield/model/datepicker-base';

/** Custom Services */
import { TasksService } from '../../tasks.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-client-approval',
  templateUrl: './client-approval.component.html',
  styleUrls: ['./client-approval.component.scss']
})
export class ClientApprovalComponent {

  /** Grouped Clients Data */
  groupedClients: any;
  /** Checks to show the data */
  showData = false;
  /** Batch Requests */
  batchRequests: any[];
  /** Datasource */
  dataSource: MatTableDataSource<any>;
  /** Row Selection Data */
  selection: SelectionModel<any>;
  /** Displayed Columns */
  displayedColumns: string[] = ['select', 'name', 'accountNumber', 'staff'];

  /**
   * Retrieves the grouped client data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dialog} dialog MatDialog.
   * @param {DatePipe} datePipe Date Pipe.
   * @param {router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   * @param {TasksService} tasksService Tasks Service.
   */
  constructor(private route: ActivatedRoute,
    private dialog: MatDialog,
    private datePipe: DatePipe,
    private router: Router,
    private settingsService: SettingsService,
    private tasksService: TasksService) {
    this.route.data.subscribe((data: { groupedClientData: any }) => {
      this.groupedClients = _.groupBy(data.groupedClientData.pageItems, 'officeName');
      if (Object.keys(this.groupedClients).length) {
        this.showData = true;
      }
      this.dataSource = new MatTableDataSource(data.groupedClientData.pageItems);
      this.selection = new SelectionModel(true, []);
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected(dataSource2: any) {
    if (dataSource2) {
      const numSelected = this.selection.selected;
      return _.difference(dataSource2, numSelected).length === 0;
    }
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle(dataSource3: any) {
    if (dataSource3) {
      this.isAllSelected(dataSource3) ?
        dataSource3.forEach((row: any) => this.selection.deselect(row)) :
        dataSource3.forEach((row: any) => this.selection.select(row));
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected(row) ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  approveClients() {
    const formfields: FormfieldBase[] = [
      new DatepickerBase({
        controlName: 'actDate',
        label: 'Date',
        value: new Date(),
        type: 'datetime-local',
        required: true
      }),
    ];
    const data = {
      title: 'Enter Clients Activation Date',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const clientApprovalDialogRef = this.dialog.open(FormDialogComponent, { data });
    clientApprovalDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.bulkClientApproval(response.data);
      }
    });
  }

  bulkClientApproval(submittedData: any) {
    const dateFormat = this.settingsService.dateFormat;
    const activationDate = this.datePipe.transform(submittedData.value.actDate, dateFormat);
    const locale = this.settingsService.language.code;
    const formData = {
      dateFormat,
      activationDate,
      locale
    };
    const selectedAccounts = this.selection.selected.length;
    const listSelectedAccounts = this.selection.selected;
    let activatedAccounts = 0;
    this.batchRequests = [];
    let reqId = 1;
    listSelectedAccounts.forEach((element: any) => {
      const url = 'clients/' + element.id + '?command=activate';
      const bodyData = JSON.stringify(formData);
      const batchData = { requestId: reqId++, relativeUrl: url, method: 'POST', body: bodyData };
      this.batchRequests.push(batchData);
    });
    this.tasksService.submitBatchData(this.batchRequests).subscribe((response: any) => {
      response.forEach((responseEle: any) => {
        if (responseEle.statusCode = '200') {
          activatedAccounts++;
          responseEle.body = JSON.parse(responseEle.body);
          if (selectedAccounts === activatedAccounts) {
            this.reload();
          }
        }
      });
    });
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/checker-inbox-and-tasks`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

}
