/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
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
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { SavingsService } from 'app/savings/savings.service';
import { AccountTransfersService } from 'app/account-transfers/account-transfers.service';
import { SettingsService } from 'app/settings/settings.service';

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { NgIf } from '@angular/common';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';

/**
 * Savings Standing Instructions Tab
 */
@Component({
  selector: 'mifosx-standing-instructions-tab',
  templateUrl: './standing-instructions-tab.component.html',
  styleUrls: ['./standing-instructions-tab.component.scss'],
  imports: [
    MatTable,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatCellDef,
    MatCell,
    NgIf,
    HasPermissionDirective,
    MatButton,
    MatTooltip,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    TranslatePipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class StandingInstructionsTabComponent implements OnInit {
  /** Savings Data */
  savingsData: any;
  /** Instructions Data */
  instructionsData: any[];
  /** Data source for instructions table. */
  dataSource = new MatTableDataSource();
  /** Columns to be displayed in instructions table. */
  displayedColumns: string[] = [
    'client',
    'fromAccount',
    'beneficiary',
    'toAccount',
    'amount',
    'validity',
    'actions'
  ];

  /** Instruction Table Reference */
  @ViewChild('instructionsTable', { static: true }) instructionTableRef: MatTable<Element>;

  /**
   * Retrieves Savings Account Data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {SettingsService} settingsService Setting service
   */
  constructor(
    private route: ActivatedRoute,
    private savingsService: SavingsService,
    private dialog: MatDialog,
    private accountTransfersService: AccountTransfersService,
    private settingsService: SettingsService
  ) {
    this.route.parent.data.subscribe((data: { savingsAccountData: any }) => {
      this.savingsData = data.savingsAccountData;
    });
  }

  ngOnInit() {
    this.getStandingInstructions();
  }

  /**
   * Retrieves standing instructions and initializes instructions table.
   */
  getStandingInstructions() {
    const clientId = this.savingsData.clientId;
    const clientName = this.savingsData.clientName;
    const accountId = this.savingsData.id;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    this.savingsService
      .getStandingInstructions(clientId, clientName, accountId, locale, dateFormat)
      .subscribe((response: any) => {
        this.instructionsData = response.pageItems;
        this.dataSource.data = this.instructionsData;
        this.instructionTableRef.renderRows();
      });
  }

  deleteStandingInstruction(instructionId: any) {
    const deleteStandingInstructionDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `standing instruction id: ${instructionId}` }
    });
    deleteStandingInstructionDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountTransfersService.deleteStandingInstrucions(instructionId).subscribe(() => {});
      }
    });
  }
}
