import { formatDate } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { SettingsService } from 'app/settings/settings.service';
import { TasksService } from 'app/tasks/tasks.service';
import { LoansService } from '../loans.service';

@Component({
  selector: 'mifosx-jlg-loans-account',
  templateUrl: './jlg-loans-account.component.html',
  styleUrls: ['./jlg-loans-account.component.scss']
})
export class JlgLoansAccountComponent implements OnInit {

  /** Table Displayed Columns */
  displayedColumns: string[] = ['check', 'position', 'name', 'weight', 'symbol', 'charges'];

  /** Table Data Source */
  dataSource: any;

  /** JLG Loan Application Form */
  jlgLoanForm: FormGroup;

  /** Check for select all the Clients List */
  selectAllItems = false;

  /** Products Catalog */
  productOptions: any[] = [];

  /** Loan Officer Catalog */
  loanOfficerOptions: any[] = [];

  /** Fund Catalog */
  fundOptions: any[] = [];

  /** Loan Purpose Catalog */
  loanPurposeOptions: any[] = [];

  /** Loan Charges */
  charges: any[] = [];

  /** Member Variations */
  memberVariations: any = {};

  /** Flag to show or hide form */
  showCompleteForm = false;

  /** Client Members */
  clientMembers: any[] = [];

  /** Response Data */
  responseData: any = {};

  /** Date Format */
  dateFormat: string;

  /** Locale */
  locale: string;

  /** Group ID */
  groupId: string;

  constructor(private formBuilder: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private loansService: LoansService,
    private settingsService: SettingsService,
    private tasksService: TasksService,
    private router: Router) {
    this.setJlgLoanForm();
  }

  /** Get Date with correct format */
  getDate(date: Date): string {
    return formatDate( date, this.dateFormat, this.locale );
  }

  ngOnInit(): void {

    const { groupId } = this.activatedRoute.snapshot.params;
    this.groupId = groupId;
    this.dateFormat = this.settingsService.dateFormat;
    this.locale = this.settingsService.language.split('-')[0];

    this.loansService.getLoansAccount(groupId).toPromise().then( (data: any) => {
      this.productOptions = data.productOptions;
      this.clientMembers = data.group.clientMembers;
      this.dataSource = new MatTableDataSource<any>(this.clientMembers);
    } );

    this.jlgLoanForm.get('productId').valueChanges.subscribe( async productId => {
      if (productId) {
        await this.loansService.getLoansAccount(groupId, productId).toPromise().then( (data: any) => {
          this.responseData = data;
          this.jlgLoanForm.get('loanOfficerId').setValue(null);
          this.jlgLoanForm.get('fundId').setValue(null);
          this.loanOfficerOptions = data.loanOfficerOptions;
          this.fundOptions = data.fundOptions;
          this.loanPurposeOptions = data.loanPurposeOptions;
          this.charges = data.charges;
          for (const member of this.clientMembers) {
            member.principal = data.memberVariations[ member.id ].principal;
            member.charges = this.charges;
          }
          return;
        } );
      }
      this.showCompleteForm = !!productId;
    } );
  }

  /**
   * Creates the JLG Loan Application Form.
   */
   setJlgLoanForm() {
    this.jlgLoanForm = this.formBuilder.group({
      'productId': ['', Validators.required],
      'loanOfficerId': [''],
      'fundId': [''],
      'submittedOnDate': [new Date(), Validators.required],
      'disbursementOnDate': [new Date(), Validators.required],
    });
  }

  /** Remove Charge */
  removeCharge(id: string, item: any) {
    item.charges = item.charges.filter( (charge: any) => charge.chargeId !== id );
  }

  /** Toggle all checks */
  toggleSelects() {
    for (const member of this.clientMembers) {
      member.selected = this.selectAllItems;
    }
  }

  /** Check if all the checks are selected */
  toggleSelect() {
    const len = this.clientMembers.length;
    this.selectAllItems = len === 0 ? false : this.clientMembers.filter( item => item.selected ).length === len;
  }

  /** Set Body for each client selected */
  setData(client: any): any {
    const data = {
      amortizationType: this.responseData.amortizationType.id,
      clientId: client.id,
      dateFormat: this.dateFormat,
      expectedDisbursementDate: this.getDate( this.jlgLoanForm.get('disbursementOnDate').value ),
      groupId: this.responseData.group.id,
      interestCalculationPeriodType: this.responseData.interestCalculationPeriodType.id,
      interestRatePerPeriod: this.responseData.interestRatePerPeriod,
      interestType: this.responseData.interestType.id,
      loanTermFrequency: this.responseData.termFrequency,
      loanTermFrequencyType: this.responseData.termPeriodFrequencyType.id,
      loanType: 'jlg',
      locale: this.locale,
      numberOfRepayments: this.responseData.numberOfRepayments,
      principal: client.principal,
      productId: this.responseData.product.id,
      repaymentEvery: this.responseData.repaymentEvery,
      repaymentFrequencyType: this.responseData.repaymentFrequencyType.id,
      submittedOnDate: this.getDate( this.jlgLoanForm.get('submittedOnDate').value ),
      syncDisbursementWithMeeting: true,
      transactionProcessingStrategyId: this.responseData.transactionProcessingStrategyId
    };
    const { fundId, loanOfficerId } = this.jlgLoanForm.value;

    if (fundId) {
      data['fundId'] = fundId;
    }

    if (loanOfficerId) {
      data['loanOfficerId'] = loanOfficerId;
    }

    if (client.charges) {
      data['charges'] = client.charges
        .map( (item: any) => ({ chargeId: item.chargeId, amount: item.amount }) );
    }

    if (client.loanPurposeId) {
      data['loanPurposeId'] = client.loanPurposeId;
    }

    return data;

  }

  /** Go Back */
  goBack(): void {
    this.router.navigate([ '/groups', this.groupId, 'general' ]);
  }

  /** Request Body Data */
  buildRequestData(): any[] {
    const membersSelected = this.clientMembers.filter( item => item.selected );
    const requestData = [];
    for (let index = 0; index < membersSelected.length; index++) {
      requestData.push({
        body: JSON.stringify( this.setData( membersSelected[ index ] ) ),
        method: 'POST',
        relativeUrl: 'loans',
        requestId: index
      });
    }
    return requestData;
  }

  /** Send Form Data */
  sendFormData() {
    const data = this.buildRequestData();
    this.tasksService.submitBatchData(data).toPromise().then( () => this.goBack() );
  }

}

