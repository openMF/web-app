import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-create-gl-account',
  templateUrl: './create-gl-account.component.html',
  styleUrls: ['./create-gl-account.component.scss']
})
export class CreateGlAccountComponent implements OnInit {

  glAccountForm: FormGroup;
  chartOfAccountsData: any;
  accountTypeData: any;
  parentData: any;
  accountUsageData: any;
  tagData: any;

  constructor(private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.createGlAccountForm();
    this.getChartOfAccountsTemplate();
    this.setGLAccountForm();
  }

  createGlAccountForm() {
    this.glAccountForm = this.formBuilder.group({
      'type': ['', Validators.required],
      'name': ['', Validators.required],
      'usage': ['', Validators.required],
      'glCode': ['', Validators.required],
      'parentId': [''],
      'tagId': [''],
      'manualEntriesAllowed': [true, Validators.required],
      'description': ['']
    });
  }

  getChartOfAccountsTemplate() {
    this.accountingService.getChartOfAccountsTemplate().subscribe((chartOfAccountsData: any) => {
      this.chartOfAccountsData = chartOfAccountsData;
      this.accountTypeData = chartOfAccountsData.accountTypeOptions;
      this.accountUsageData = chartOfAccountsData.usageOptions;
    });
  }

  setGLAccountForm() {
    this.glAccountForm.get('type').valueChanges.subscribe(accountTypeId => {
      switch (accountTypeId) {
        case 1: this.parentData = this.chartOfAccountsData.assetHeaderAccountOptions;
                this.tagData = this.chartOfAccountsData.allowedAssetsTagOptions;
        break;
        case 2: this.parentData = this.chartOfAccountsData.liabilityHeaderAccountOptions;
                this.tagData = this.chartOfAccountsData.allowedLiabilitiesTagOptions;
        break;
        case 3: this.parentData = this.chartOfAccountsData.equityHeaderAccountOptions;
                this.tagData = this.chartOfAccountsData.allowedEquityTagOptions;
        break;
        case 4: this.parentData = this.chartOfAccountsData.incomeHeaderAccountOptions;
                this.tagData = this.chartOfAccountsData.allowedIncomeTagOptions;
        break;
        case 5: this.parentData = this.chartOfAccountsData.expenseHeaderAccountOptions;
                this.tagData = this.chartOfAccountsData.allowedExpensesTagOptions;
        break;
      }
    });
  }

  submit() {
    this.accountingService.createGlAccount(this.glAccountForm.value).subscribe((response: any) => {
      this.router.navigate(['/accounting/chart-of-accounts/gl-accounts/view', response.resourceId]);
    });
  }

}
