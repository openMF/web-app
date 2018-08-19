/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';

/**
 * Edit financial activity mapping component.
 */
@Component({
  selector: 'mifosx-edit-financial-activity-mapping',
  templateUrl: './edit-financial-activity-mapping.component.html',
  styleUrls: ['./edit-financial-activity-mapping.component.scss']
})
export class EditFinancialActivityMappingComponent implements OnInit {

  /** Financial activity mapping form. */
  financialActivityMappingForm: FormGroup;
  /** GL Account options. */
  glAccountOptions: any;
  /** GL Account data. */
  glAccountData: any;
  /** Financial activity data. */
  financialActivityData: any;
  /** Financial activity account ID. */
  financialActivityAccountId: string;
  /** Financial activity ID. */
  financialActivityId: number;
  /** GL Account ID. */
  glAccountId: number;

  /**
   * Retrieves the gl account options, financial activity and financial activity account data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(private formBuider: FormBuilder,
              private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe((data: { financialActivityAccountAndTemplate: any }) => {
      this.financialActivityAccountId = data.financialActivityAccountAndTemplate.id;
      this.financialActivityId = data.financialActivityAccountAndTemplate.financialActivityData.id;
      this.glAccountId = data.financialActivityAccountAndTemplate.glAccountData.id;
      this.glAccountOptions = data.financialActivityAccountAndTemplate.glAccountOptions;
      this.financialActivityData = data.financialActivityAccountAndTemplate.financialActivityOptions;
    });
  }

  /**
   * Creates and sets the financial activity mapping form and sets the gl account data.
   */
  ngOnInit() {
    this.createFinancialActivityMappingForm();
    this.setGLAccountData();
    this.financialActivityMappingForm.get('financialActivityId').setValue(this.financialActivityId);
    this.financialActivityMappingForm.get('glAccountId').setValue(this.glAccountId);
  }

  /**
   * Creates the financial activity mapping form.
   */
  createFinancialActivityMappingForm() {
    this.financialActivityMappingForm = this.formBuider.group({
      'financialActivityId': ['', Validators.required],
      'glAccountId': ['', Validators.required]
    });
  }

  /**
   * Sets the gl account data on the basis of selected financial activity.
   */
  setGLAccountData() {
    this.financialActivityMappingForm.get('financialActivityId').valueChanges
      .subscribe(financialActivityId => {
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

  /**
   * Submits the financial activity mapping form and updates financial activity account,
   * if successful redirects to view updated account.
   */
  submit() {
    this.accountingService.updateFinancialActivityAccount(this.financialActivityAccountId, this.financialActivityMappingForm.value)
      .subscribe((response: any) => {
        this.router.navigate(['../../', response.resourceId], { relativeTo: this.route });
    });
  }

}
