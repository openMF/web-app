import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-edit-financial-activity-mapping',
  templateUrl: './edit-financial-activity-mapping.component.html',
  styleUrls: ['./edit-financial-activity-mapping.component.scss']
})
export class EditFinancialActivityMappingComponent implements OnInit {

  financialActivityMappingForm: FormGroup;
  glAccountOptions: any;
  glAccountData: any;
  financialActivityAccountId: any;
  financialActivityData: any;

  constructor(private route: ActivatedRoute,
              private formBuider: FormBuilder,
              private accountingService: AccountingService,
              private router: Router) { }

  ngOnInit() {
    this.financialActivityAccountId = this.route.snapshot.paramMap.get('id');
    this.createFinancialActivityMappingForm();
    this.setGLAccountData();
    this.getFinancialActivityAccount();
  }

  createFinancialActivityMappingForm() {
    this.financialActivityMappingForm = this.formBuider.group({
      'financialActivityId': ['', Validators.required],
      'glAccountId': ['', Validators.required]
    });
  }

  getFinancialActivityAccount() {
    this.accountingService.getFinancialActivityAccount(this.financialActivityAccountId, true)
      .subscribe((financialActivityAccountData: any) => {
        this.glAccountOptions = financialActivityAccountData.glAccountOptions;
        this.financialActivityData = financialActivityAccountData.financialActivityOptions;
        this.financialActivityMappingForm.get('financialActivityId').setValue(financialActivityAccountData.financialActivityData.id);
        this.financialActivityMappingForm.get('glAccountId').setValue(financialActivityAccountData.glAccountData.id);
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
    this.accountingService.updateFinancialActivityAccount(this.financialActivityAccountId, this.financialActivityMappingForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['/accounting/financial-activity-mappings/view', response.resourceId]);
    });
  }

}
