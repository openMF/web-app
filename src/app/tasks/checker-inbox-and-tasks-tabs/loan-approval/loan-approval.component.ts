/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SelectionModel } from '@angular/cdk/collections';
import * as _ from 'lodash';
import {
  MatTableDataSource,
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
import { MatDialog } from '@angular/material/dialog';

/** Dialog Imports */
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

/** Custom Services */
import { TasksService } from '../../tasks.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { TranslateService } from '@ngx-translate/core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatCheckbox } from '@angular/material/checkbox';
import { FormatNumberPipe } from '../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

interface OfficeNode {
  id: number;
  name: string;
  loans: any[];
}

@Component({
  selector: 'mifosx-loan-approval',
  templateUrl: './loan-approval.component.html',
  styleUrls: ['./loan-approval.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCheckbox,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    FormatNumberPipe
  ]
})
export class LoanApprovalComponent {
  /** Offices Data */
  offices: any;
  /** Loans Data */
  loans: any;
  /** Checks whether to show data or not */
  showData = false;
  /** Data source for loans approval table. */
  dataSource: MatTableDataSource<any>;
  /** Row Selection Data */
  selection: SelectionModel<any>;
  /** Map data */
  idToNodeMap: { [key: number]: OfficeNode } = {};
  /** Grouped Office Data */
  officesArray: any[];
  /** List of Requests */
  batchRequests: any[];
  /** Displayed Columns */
  displayedColumns: string[] = [
    'select',
    'clientName',
    'loan',
    'amount',
    'loanPurpose'
  ];

  /**
   * Retrieves the offices and loans data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Dialog} dialog MatDialog.
   * @param {Dates} dateUtils Date Utils.
   * @param {router} router Router.
   * @param {SettingsService} settingsService Settings Service.
   * @param {TasksService} tasksService Tasks Service.
   */
  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private dateUtils: Dates,
    private router: Router,
    private translateService: TranslateService,
    private settingsService: SettingsService,
    private tasksService: TasksService
  ) {
    this.route.data.subscribe((data: { officesData: any; loansData: any }) => {
      this.offices = data.officesData;
      this.loans = data.loansData.pageItems;
      this.setOfficeData();
    });
  }

  /** Group Office Data */
  setOfficeData() {
    this.offices.forEach((officeEle: any) => {
      officeEle.loans = [];
      this.idToNodeMap[officeEle.id] = officeEle;
    });
    this.loans.forEach((loanEle: any) => {
      if (loanEle.status.pendingApproval) {
        let tempOffice: OfficeNode | undefined;
        if (loanEle.clientOfficeId) {
          tempOffice = this.idToNodeMap[loanEle.clientOfficeId];
        } else if (loanEle.group?.officeId) {
          tempOffice = this.idToNodeMap[loanEle.group.officeId];
        }

        if (tempOffice) {
          tempOffice.loans.push(loanEle);
        }
      }
    });
    const finalArray: any[] = [];
    this.offices.forEach((officeEle: any) => {
      if (officeEle.loans && officeEle.loans.length > 0) {
        this.showData = true;
        finalArray.push(officeEle);
      }
    });
    this.officesArray = finalArray;
    this.dataSource = new MatTableDataSource(this.officesArray);
    this.selection = new SelectionModel(true, []);
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
      this.isAllSelected(dataSource3)
        ? dataSource3.forEach((row: any) => this.selection.deselect(row))
        : dataSource3.forEach((row: any) => this.selection.select(row));
    }
  }

  /** The label for the checkbox on the passed row */
  checkboxLabel(row?: any): string {
    if (!row) {
      return `${this.isAllSelected(row) ? 'select' : 'deselect'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position + 1}`;
  }

  approveLoan() {
    const approveLoanDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.heading.Approve Loan'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want to Approve Loan')
      }
    });
    approveLoanDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.bulkLoanApproval();
      }
    });
  }

  bulkLoanApproval() {
    const dateFormat = this.settingsService.dateFormat;
    const approvedOnDate = this.dateUtils.formatDate(new Date(), dateFormat);
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
      const url = 'loans/' + element.id + '?command=approve';
      const bodyData = JSON.stringify(formData);
      const batchData = { requestId: reqId++, relativeUrl: url, method: 'POST', body: bodyData };
      this.batchRequests.push(batchData);
    });
    this.tasksService.submitBatchData(this.batchRequests).subscribe((response: any) => {
      response.forEach((responseEle: any) => {
        if ((responseEle.statusCode = '200')) {
          approvedAccounts++;
          responseEle.body = JSON.parse(responseEle.body);
          if (selectedAccounts === approvedAccounts) {
            this.loanResource();
          }
        }
      });
      this.reload();
    });
  }

  applyFilter(filterValue: string = '') {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  loanResource() {
    this.tasksService.getAllLoansToBeApproved().subscribe((response: any) => {
      this.loans = response.pageItems;
      this.loans = this.loans.filter((account: any) => {
        return account.status.waitingForDisbursal === true;
      });
      this.dataSource = new MatTableDataSource(this.loans);
      this.selection = new SelectionModel(true, []);
    });
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router
      .navigateByUrl(`/checker-inbox-and-tasks`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }
}
