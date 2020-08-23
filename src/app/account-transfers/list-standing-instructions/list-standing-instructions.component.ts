/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';
import { FormControl } from '@angular/forms';

/** Custom Services */
import { AccountTransfersService } from '../account-transfers.service';

/** Dialog Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Lists all the standing intructions of particular ID
 */
@Component({
  selector: 'mifosx-list-standing-instructions',
  templateUrl: './list-standing-instructions.component.html',
  styleUrls: ['./list-standing-instructions.component.scss']
})
export class ListStandingInstructionsComponent implements OnInit {

  /** Recurring Deposits Data */
  standingIntructionsTemplateData: any;
  /** Instructions Data */
  instructionsData: any[];
  /** Name form control. */
  transferType = new FormControl();
  /** ExternalId form control. */
  fromAccountId = new FormControl();
  /** Name form control. */
  clientNameControl = new FormControl();
  /** ExternalId form control. */
  fromClientId = new FormControl();
  /** Client Name */
  clientName: any;
  /** Transfer Type Options Data */
  transferTypeDatas: any;
  /** Account Type */
  accountType: any;
  /** Account Type ID */
  accountTypeId: string;
  /** Id */
  id: any;
  /** Is from Client? */
  isFromClient: Boolean;
  /** Data source for instructions table. */
  dataSource = new MatTableDataSource();
  /** Columns to be displayed in instructions table. */
  displayedColumns: string[] = ['client', 'fromAccount', 'beneficiary', 'toAccount', 'amount', 'validity', 'actions'];

  /** Instruction Table Reference */
  @ViewChild('instructionsTable', { static: true }) instructionTableRef: MatTable<Element>;
  /** Paginator for centers table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;


  /**
   * Retrieves Standing Instructions Data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {MatDialog} route Mat Dialog
   * @param {SettingsService} settingsService Settings Service
   * @param {AccountTransfersService} accountTransfersService Account Transfers Service
   */
  constructor(private route: ActivatedRoute,
    private accountTransfersService: AccountTransfersService,
    private settingsService: SettingsService,
    private dialog: MatDialog) {
    this.route.data.subscribe((data: { standingIntructionsTemplate: any }) => {
      this.standingIntructionsTemplateData = data.standingIntructionsTemplate;
      if (data.standingIntructionsTemplate.fromClient) {
        this.clientName = this.standingIntructionsTemplateData.fromClient.displayName;
        this.getStandingInstructions();
      }
      this.setParams();
      this.transferTypeDatas = this.standingIntructionsTemplateData.transferTypeOptions;
    });
  }

  ngOnInit() {
  }

  setParams() {
    this.accountType = this.route.snapshot.queryParams['accountType'];
    switch (this.accountType) {
      case 'fromloans':
        this.accountTypeId = '1';
        break;
      case 'fromsavings':
        this.accountTypeId = '2';
        break;
      default:
        this.accountTypeId = '0';
    }
    this.isFromClient = this.route.parent.parent.snapshot.params['clientId'] ? true : false;
  }

  filterStandingInstructions() {
    this.getStandingInstructions();
  }

  /**
   * Retrieves standing instructions and initializes instructions table.
   */
  getStandingInstructions() {
    const dateFormat = this.settingsService.dateFormat;
    const locale = this.settingsService.language.code;
    const searchData = {
      clientId : this.standingIntructionsTemplateData.fromClient.id || this.fromClientId.value,
      clientName: this.standingIntructionsTemplateData.fromClient.displayName || this.clientNameControl.value,
      locale,
      dateFormat,
      limit: 14,
      offset: 0,
      fromAccountType: this.accountTypeId,
      fromAccountId: this.fromAccountId.value,
      fromTransferType: this.transferType.value
    };
    this.accountTransfersService.getStandingInstructions(searchData).subscribe((response: any) => {
      this.instructionsData = response.pageItems;
      this.dataSource.data = this.instructionsData;
      this.instructionTableRef.renderRows();
    });
  }

  /** Deletes selected Standing Instruction */
  deleteStandingInstruction(instructionId: any) {
    const deleteStandingInstructionDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `standing instruction id: ${instructionId}` }
    });
    deleteStandingInstructionDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.accountTransfersService.deleteStandingInstrucions(instructionId)
          .subscribe(() => {});
      }
    });
  }

}

