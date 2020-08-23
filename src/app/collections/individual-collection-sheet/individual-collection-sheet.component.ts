/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePipe } from '@angular/common';

/** Services Import */
import { CollectionsService } from '../collections.service';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/**
 * Individual Collection Sheet
 */
@Component({
  selector: 'mifosx-individual-collection-sheet',
  templateUrl: './individual-collection-sheet.component.html',
  styleUrls: ['./individual-collection-sheet.component.scss']
})
export class IndividualCollectionSheetComponent implements OnInit {

  /** Offices Data */
  officesData: any;
  /** Loan Officer Data */
  loanOfficerData: any = [];
  /** Loans Data */
  loansData: any = [];
  /** Savings Data */
  savingsData: any = [];
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Collection Sheet form. */
  collectionSheetForm: FormGroup;
  /** Toggles b/w form and table */
  isCollapsed = false;
  /** Collections Sheet Data */
  collectionSheetData: any;
  /** checks and stores the local storage values */
  Success: boolean;
  /** Bulk Disbursement Transactions Data */
  bulkDisbursementTransactionsData = {};
  /** Bulk Repayment Transactions Data */
  bulkRepaymentTransactions: any[] = [];
  /** Bulk Savings Due Data */
  bulkSavingsDueTransactions: any[] = [];
  /** Checks if there is no client data in the response */
  noData = false;

  /** Columns to be displayed in loans table. */
  loansDisplayedColumns: string[] = ['loanAccount', 'productName', 'clientName', 'totalDue', 'charges', 'actions'];
  /** Columns to be displayed in savings table. */
  savingsDisplayedColumns: string[] = ['depositAccount', 'savingsAccountNo', 'productName', 'clientName', 'totalDue', 'actions'];

  /** Data source for loans table. */
  loansDataSource: MatTableDataSource<any>;
  /** Data source for savings table. */
  savingsDataSource: MatTableDataSource<any>;


  /** Paginator for table. */
  @ViewChild(MatPaginator, { read: true }) paginator: MatPaginator;
  /** Sorter for table. */
  @ViewChild(MatSort, { read: true }) sort: MatSort;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} collectionsService Organization Service.
   * @param {Route} route Route.
   * @param {DatePipe} datePipe Date Pipe to format date.
   * @param {Dialog} dialog Dialog component.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuilder: FormBuilder,
    private collectionsService: CollectionsService,
    private route: ActivatedRoute,
    private datePipe: DatePipe,
    public dialog: MatDialog,
    private router: Router, ) {
    this.route.data.subscribe((data: { officesData: any }) => {
      this.officesData = data.officesData;
    });
  }

  ngOnInit() {
    if (localStorage.getItem('Success')) {
      localStorage.removeItem('Success');
      this.Success = true;
      setTimeout(() => { this.Success = false; }, 3000);
    }
    this.createCollectionSheetForm();
    this.buildDependencies();
  }

  /**
   * Creates the Individual Collection Sheet Form
   */
  createCollectionSheetForm() {
    this.collectionSheetForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'transactionDate': [new Date(), Validators.required],
      'staffId': ['']
    });
  }

  /**
   * Checks for the office id value change
   */
  buildDependencies() {
    this.collectionSheetForm.get('officeId').valueChanges.subscribe((value: any) => {
      this.collectionsService.getStaffs(value).subscribe((response: any) => {
        this.loanOfficerData = response;
      });
    });
  }

  /**
   * Initializes the data source, paginator and sorter for loans and savings table.
   * @param {any} data
   */
  organizeData(data: any) {
    data.clients.forEach((client: any) => {
      if (client.loans) {
        client.loans.forEach((loan: any) => {
          const loanData = {
            ...loan,
            clientName: client.clientName,
            clientId: client.clientId
          };
          this.loansData.push(loanData);
        });
      }
      if (client.savings) {
        client.savings.forEach((saving: any) => {
          const savingData = {
            ...saving,
            clientName: client.clientName,
            clientId: client.clientId
          };
          this.savingsData.push(savingData);
        });
      }
    });
    if (this.loansData.length > 0) {
      this.loansDataSource = new MatTableDataSource(this.loansData);
      this.loansDataSource.paginator = this.paginator;
      this.loansDataSource.sort = this.sort;
    }
    if (this.savingsData.length > 0) {
      this.savingsDataSource = new MatTableDataSource(this.savingsData);
      this.savingsDataSource.paginator = this.paginator;
      this.savingsDataSource.sort = this.sort;
    }
  }

  /**
   * Gets Loan Total Due Amount
   */
  getLoanTotalDueAmount (loan: any) {
    let principalInterestDue = loan.totalDue;
    let chargesDue = loan.chargesDue;
    if (isNaN(principalInterestDue)) {
      principalInterestDue = 0;
    }
    if (isNaN(chargesDue)) {
      chargesDue = 0;
    }
    return Math.ceil((Number(principalInterestDue) + Number(chargesDue)) * 100) / 100;
  }

  /**
   * Shows the payment dialog box and stores the return data
   */
  showAndStorePaymentDetails(type: any, selectedData: any, index: number) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'paymentTypeId',
        label: 'Payment Type',
        options: { label: 'name', value: 'id', data: this.collectionSheetData.paymentTypeOptions },
        required: false
      }),
      new InputBase({
        controlName: 'accountNumber',
        label: 'Account #',
        type: 'number',
        required: false
      }),
      new InputBase({
        controlName: 'checkNumber',
        label: 'Cheque #',
        type: 'number',
        required: false
      }),
      new InputBase({
        controlName: 'routingCode',
        label: 'Routing Code',
        type: 'text',
        required: false
      }),
      new InputBase({
        controlName: 'receiptNumber',
        label: 'Receipt #',
        type: 'number',
        required: false
      }),
      new InputBase({
        controlName: 'bankNumber',
        label: 'Bank #',
        type: 'number',
        required: false
      }),
    ];
    const data = {
      title: `Payment for ${type === 'loans' ? 'Loan' : 'Saving'} Id ${type === 'loans' ? selectedData.loanId : selectedData.savingsId}`,
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const showPaymentDetailsDialogRef = this.dialog.open(FormDialogComponent, { data });
    showPaymentDetailsDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        if (type === 'loans') {
          const totalDue = this.getLoanTotalDueAmount(selectedData);
          const loanTransaction = {
            loanId: selectedData.loanId,
            transactionAmount: totalDue
          };
          if (response.data.value.paymentTypeId !== '') {
            loanTransaction['paymentTypeId'] = response.data.value.paymentTypeId;
            loanTransaction['accountNumber'] = response.data.value.accountNumber;
            loanTransaction['checkNumber'] = response.data.value.checkNumber;
            loanTransaction['routingCode'] = response.data.value.routingCode;
            loanTransaction['receiptNumber'] = response.data.value.receiptNumber;
            loanTransaction['bankNumber'] = response.data.value.bankNumber;
          }
          this.bulkRepaymentTransactions.push(loanTransaction);
        } else {
          let dueAmount = selectedData.dueAmount;
          if (isNaN(dueAmount)) {
            dueAmount = 0;
          }
          const savingsTransaction = {
            savingsId: selectedData.savingsId,
            transactionAmount: dueAmount,
            depositAccountType: selectedData.depositAccountType === 'Saving Deposit' ? 100 : (selectedData.depositAccountType === 'Recurring Deposit' ? 300 : 400)
          };
          if (response.data.paymentTypeId !== '') {
            savingsTransaction['paymentTypeId'] = response.data.paymentTypeId;
            savingsTransaction['accountNumber'] = response.data.accountNumber;
            savingsTransaction['checkNumber'] = response.data.checkNumber;
            savingsTransaction['routingCode'] = response.data.routingCode;
            savingsTransaction['receiptNumber'] = response.data.receiptNumber;
            savingsTransaction['bankNumber'] = response.data.bankNumber;
          }
          if (savingsTransaction.transactionAmount > 0) {
            this.bulkSavingsDueTransactions.push(savingsTransaction);
          }
        }
      }
    });
  }

  /**
   * Searches collection sheet data
   */
  previewCollectionSheet() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    const collectionSheet = {
      ...this.collectionSheetForm.value,
      'transactionDate': this.datePipe.transform(this.collectionSheetForm.value.transactionDate, dateFormat),
      dateFormat,
      locale
    };
    if (collectionSheet.staffId === '') {
      delete collectionSheet.staffId;
    }
    this.collectionsService.retrieveCollectionSheetData(collectionSheet).subscribe((response: any) => {
      if (response.clients.length > 0) {
        this.collectionSheetData = response;
        this.organizeData(response);
        this.isCollapsed = true;
      } else {
        this.noData = true;
        setTimeout(() => { this.noData = false; }, 3000);
      }
    });
  }

  /**
   * Submit the data with all the payments data
   */
  submit() {
    // TODO: Update once language and date settings are setup
    const locale = 'en';
    const dateFormat = 'dd MMMM yyyy';
    this.bulkDisbursementTransactionsData['bulkRepaymentTransactions'] = this.bulkRepaymentTransactions;
    this.bulkDisbursementTransactionsData['bulkSavingsDueTransactions'] = this.bulkSavingsDueTransactions;
    const finalSubmitData = {
      dateFormat,
      locale,
      actualDisbursementDate: this.datePipe.transform(this.collectionSheetForm.value.transactionDate, dateFormat),
      transactionDate: this.datePipe.transform(this.collectionSheetForm.value.transactionDate, dateFormat),
      bulkDisbursementTransactions: this.bulkDisbursementTransactionsData
    };
    this.collectionsService.executeSaveCollectionSheet(finalSubmitData).subscribe(() => {
      this.reload();
      localStorage.setItem('Success', 'true');
    });
  }

  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/collections`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

}
