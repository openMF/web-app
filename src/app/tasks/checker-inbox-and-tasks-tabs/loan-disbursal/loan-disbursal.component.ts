/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import { DatePipe } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

/** Dialog Imports */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Services */
import { TasksService } from '../../tasks.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-loan-disbursal',
  templateUrl: './loan-disbursal.component.html',
  styleUrls: ['./loan-disbursal.component.scss']
})
export class LoanDisbursalComponent {

  /** Loans Data */
  loans: any;
  /** Batch Requests */
  batchRequests: any[];
  /** Datasource for loans disbursal table */
  dataSource: MatTableDataSource<any>;
  /** Row Selection */
  selection: SelectionModel<any>;
  /** Displayed Columns for loan disbursal data */
  displayedColumns: string[] = ['select', 'client', 'loanAccountNumber', 'loanProduct', 'principal'];

  /**
   * Retrieves the loans data from `resolve`.
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
    private settingsService: SettingsService,
    private tasksService: TasksService) {
    this.route.data.subscribe((data: { loansData: any }) => {
      this.loans = data.loansData.pageItems;
      this.loans = this.loans.filter((account: any) => {
        return (account.status.waitingForDisbursal === true);
      });
      this.dataSource = new MatTableDataSource(this.loans);
      this.selection = new SelectionModel(true, []);
    });
  }

  /** Whether the number of selected elements matches the total number of rows. */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach((row: any) => this.selection.select(row));
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected() ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  disburseLoan() {
    const disburseLoanDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: 'Loan Disbursal', dialogContext: 'Are you sure you want to Disburse Loan' }
    });
    disburseLoanDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.bulkLoanDisbursal();
      }
    });
  }

  bulkLoanDisbursal() {
    const dateFormat = this.settingsService.dateFormat;
    const approvedOnDate = this.datePipe.transform(new Date(), dateFormat);
    const locale = this.settingsService.language.code;
    const formData = {
      dateFormat,
      approvedOnDate,
      locale
    };
    const selectedAccounts = this.selection.selected.length;
    const listSelectedAccounts = this.selection.selected;
    let approvedAccounts = 0;
    this.batchRequests = [];
    let reqId = 1;
    listSelectedAccounts.forEach((element: any) => {
      const url = 'loans/' + element.id + '?command=disburse';
      const bodyData = JSON.stringify(formData);
      const batchData = { requestId: reqId++, relativeUrl: url, method: 'POST', body: bodyData };
      this.batchRequests.push(batchData);
    });
    this.tasksService.submitBatchData(this.batchRequests).subscribe((response: any) => {
      console.log(response);
      response.forEach((responseEle: any) => {
        if (responseEle.statusCode = '200') {
          approvedAccounts++;
          responseEle.body = JSON.parse(responseEle.body);
          if (selectedAccounts === approvedAccounts) {
            this.loanResource();
          }
        }
      });
    });
  }

  loanResource() {
    this.tasksService.getAllLoans().subscribe((response: any) => {
      this.loans = response.pageItems;
      this.loans = this.loans.filter((account: any) => {
        return (account.status.waitingForDisbursal === true);
      });
      this.dataSource = new MatTableDataSource(this.loans);
      this.selection = new SelectionModel(true, []);
    });
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
