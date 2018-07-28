import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-create-financial-activity-mapping',
  templateUrl: './create-financial-activity-mapping.component.html',
  styleUrls: ['./create-financial-activity-mapping.component.scss']
})
export class CreateFinancialActivityMappingComponent implements OnInit {

  financialActivityMappingForm: FormGroup;
  glAccountOptions: any;
  glAccountData: any;
  financialActivityData: any;

  constructor(private formBuider: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.createFinancialActivityMappingForm();
    this.getFinancialActivityAccountsTemplate();
    this.setGLAccountData();
  }

  createFinancialActivityMappingForm() {
    this.financialActivityMappingForm = this.formBuider.group({
      'financialActivityId': ['', Validators.required],
      'glAccountId': ['', Validators.required]
    });
  }

  getFinancialActivityAccountsTemplate() {
    this.accountingService.getFinancialActivityAccountsTemplate().subscribe((financialActivityAccountData: any) => {
      this.glAccountOptions = financialActivityAccountData.glAccountOptions;
      this.financialActivityData = financialActivityAccountData.financialActivityOptions;
    });
  }

  setGLAccountData() {
    this.financialActivityMappingForm.get('financialActivityId').valueChanges.subscribe(financialActivityId => {
      switch (financialActivityId) {
        case 100:
        case 101:
        case 102:
        case 103: this.glAccountData = this.glAccountOptions.assetAccountOptions;
        break;
        case 200:
        case 201: this.glAccountData = this.glAccountOptions.liabilityAccountOptions;
        break;
        case 300: this.glAccountData = this.glAccountOptions.equityAccountOptions;
        break;
      }
    });
  }

  submit() {
    this.accountingService.createFinancialActivityAccount(this.financialActivityMappingForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['/accounting/financial-activity-mappings/view', response.resourceId]);
    });
  }

}
