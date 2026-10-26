/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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

interface Loan {
  id: number;
  clientId: number;
  clientName: string;
  accountNo: string;
  loanProductName: string;
  principal: number;
  loanPurposeName: string;
  status: {
    waitingForDisbursal: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

interface Office {
  id: number;
  name: string;
  loans: Loan[];
  dataSource: MatTableDataSource<Loan>;
}

interface BatchRequest {
  requestId: number;
  relativeUrl: string;
  method: string;
  body: string;
}

interface ResolverData {
  officesData: any[];
  loansData: {
    pageItems: Loan[];
  };
}

@Component({
  selector: 'mifosx-council-approval',
  templateUrl: './council-approval.component.html',
  styleUrls: ['./council-approval.component.scss'],
  standalone: true,
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
export class CouncilApprovalComponent {
  private route = inject(ActivatedRoute);
  private dialog = inject(MatDialog);
  private dateUtils = inject(Dates);
  private router = inject(Router);
  private translateService = inject(TranslateService);
  private settingsService = inject(SettingsService);
  private tasksService = inject(TasksService);
  private destroyRef = inject(DestroyRef);

  /** Offices Data */
  offices: any[];
  /** Loans Data */
  loans: Loan[];
  /** Checks whether to show data or not */
  showData = false;
  /** Row Selection Data */
  selection: SelectionModel<Loan>;
  /** Map data */
  idToNodeMap: { [key: number]: Office } = {};
  /** Grouped Office Data */
  officesArray: Office[];
  /** List of Requests */
  batchRequests: BatchRequest[];
  /** Displayed Columns */
  displayedColumns: string[] = [
    'select',
    'clientName',
    'loan',
    'amount',
    'loanPurpose'
  ];

  constructor() {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: ResolverData) => {
      this.offices = data.officesData;
      this.loans = data.loansData.pageItems;
      this.setOfficeData();
    });
  }

  /** Group Office Data */
  setOfficeData() {
    this.showData = false;
    this.officesArray = [];
    this.idToNodeMap = {};
    this.offices.forEach((officeEle: Office) => {
      officeEle.loans = [];
      this.idToNodeMap[officeEle.id] = officeEle;
    });
    this.loans.forEach((loanEle: Loan) => {
      // Show loans that are approved (status 200) but not yet disbursed.
      // In Mifos, status 200 has waitingForDisbursal: true.
      if (loanEle.status.waitingForDisbursal) {
        let tempOffice: Office | undefined;
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
    this.offices.forEach((officeEle: Office) => {
      if (officeEle.loans && officeEle.loans.length > 0) {
        this.showData = true;
        officeEle.dataSource = new MatTableDataSource(officeEle.loans);
        finalArray.push(officeEle);
      }
    });
    this.officesArray = finalArray;
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
  checkboxLabel(row?: Loan | Loan[]): string {
    if (!row || Array.isArray(row)) {
      return `${this.isAllSelected(row) ? 'deselect' : 'select'} all`;
    }
    return `${this.selection.isSelected(row) ? 'deselect' : 'select'} row ${row.position ? row.position + 1 : ''}`;
  }

  approveLoan() {
    const approveLoanDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        heading: this.translateService.instant('labels.text.Council Approval'),
        dialogContext: this.translateService.instant('labels.dialogContext.Are you sure you want to Approve Loan')
      }
    });
    approveLoanDialogRef.afterClosed().subscribe((response: { confirm: boolean } | undefined) => {
      if (response?.confirm) {
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
      // For now, we use the same approve command.
      // In a real scenario, this might be a custom command or a different step.
      const url = 'loans/' + element.id + '?command=approve';
      const bodyData = JSON.stringify(formData);
      const batchData = { requestId: reqId++, relativeUrl: url, method: 'POST', body: bodyData };
      this.batchRequests.push(batchData);
    });
    this.tasksService.submitBatchData(this.batchRequests).subscribe((response: any) => {
      response.forEach((responseEle: any) => {
        if (responseEle.statusCode === '200') {
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
    const filter = filterValue.trim().toLowerCase();
    this.officesArray.forEach((office) => {
      office.dataSource.filter = filter;
    });
  }

  loanResource() {
    this.tasksService.getAllLoansToBeApproved().subscribe((response: any) => {
      this.loans = response.pageItems;
      this.setOfficeData();
    });
  }

  reload() {
    const url: string = this.router.url;
    this.router
      .navigateByUrl(`/checker-inbox-and-tasks`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }
}
