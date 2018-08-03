import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-edit-gl-account',
  templateUrl: './edit-gl-account.component.html',
  styleUrls: ['./edit-gl-account.component.scss']
})
export class EditGlAccountComponent implements OnInit {

  glAccountForm: FormGroup;
  glAccount: any;
  accountTypeData: any;
  accountUsageData: any;
  parentData: any;
  tagData: any;

  constructor(private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) {
    this.route.data.subscribe((data: { glAccount: any }) => {
      this.glAccount = data.glAccount;
    });
  }

  ngOnInit() {
    this.createGlAccountForm();
    this.setGLAccountForm();
  }

  createGlAccountForm() {
    this.glAccountForm = this.formBuilder.group({
      'type': ['', Validators.required],
      'name': [this.glAccount.name, Validators.required],
      'usage': [this.glAccount.usage.id, Validators.required],
      'glCode': [this.glAccount.glCode, Validators.required],
      'parentId': [this.glAccount.parentId],
      'tagId': [this.glAccount.tagId.id],
      'manualEntriesAllowed': [this.glAccount.manualEntriesAllowed, Validators.required],
      'description': [this.glAccount.description]
    });
  }

  setGLAccountForm() {
    this.accountTypeData = this.glAccount.accountTypeOptions;
    this.accountUsageData = this.glAccount.usageOptions;
    this.glAccountForm.get('type').valueChanges.subscribe(accountTypeId => {
      switch (accountTypeId) {
        case 1: this.parentData = this.glAccount.assetHeaderAccountOptions;
                this.tagData = this.glAccount.allowedAssetsTagOptions;
        break;
        case 2: this.parentData = this.glAccount.liabilityHeaderAccountOptions;
                this.tagData = this.glAccount.allowedLiabilitiesTagOptions;
        break;
        case 3: this.parentData = this.glAccount.equityHeaderAccountOptions;
                this.tagData = this.glAccount.allowedEquityTagOptions;
        break;
        case 4: this.parentData = this.glAccount.incomeHeaderAccountOptions;
                this.tagData = this.glAccount.allowedIncomeTagOptions;
        break;
        case 5: this.parentData = this.glAccount.expenseHeaderAccountOptions;
                this.tagData = this.glAccount.allowedExpensesTagOptions;
        break;
      }
    });
    this.glAccountForm.get('type').setValue(this.glAccount.type.id);
  }

  submit() {
    this.accountingService.updateGlAccount(this.glAccount.id, this.glAccountForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['/accounting/chart-of-accounts/gl-accounts/view', response.resourceId]);
      });
  }

}
