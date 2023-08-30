/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { AccountingService } from '../../accounting.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { ContinueSetupDialogComponent } from '../../../configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';

/**
 * Create gl account component.
 */
@Component({
  selector: 'mifosx-create-gl-account',
  templateUrl: './create-gl-account.component.html',
  styleUrls: ['./create-gl-account.component.scss']
})
export class CreateGlAccountComponent implements OnInit, AfterViewInit {

  /** GL account form. */
  glAccountForm: UntypedFormGroup;
  /** Chart of accounts data. */
  chartOfAccountsData: any;
  /** Account type data. */
  accountTypeData: any;
  /** Account usage data. */
  accountUsageData: any;
  /** Parent data. */
  parentData: any;
  /** Tag data. */
  tagData: any;
  /** Account type id. (for creation of sub-ledger account) */
  accountTypeId: number;
  /** Parent id. (for creation of sub-ledger account) */
  parentId: number;
  /** Cancel route. (depending on creation of gl account or sub-ledger account) */
  cancelRoute = '../../';

  /* Reference of accounts form */
  @ViewChild('accountFormRef') accountFormRef: ElementRef<any>;
  /* Template for popover on accounts form */
  @ViewChild('templateAccountFormRef') templateAccountFormRef: TemplateRef<any>;

  /**
   * Retrieves the chart of accounts data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   * @param {Matdialog} dialog Matdialog.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private accountingService: AccountingService,
              private route: ActivatedRoute,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService,
              public dialog: MatDialog) {
    this.route.queryParamMap.subscribe(params => {
      this.accountTypeId = Number(params.get('accountType'));
      this.parentId = Number(params.get('parent'));
      if (this.parentId) {
        this.cancelRoute = `../view/${this.parentId}`;
      }
    });

    this.route.data.subscribe((data: { chartOfAccountsTemplate: any }) => {
      this.chartOfAccountsData = data.chartOfAccountsTemplate;
      this.accountTypeData = data.chartOfAccountsTemplate.accountTypeOptions;
      this.accountUsageData = data.chartOfAccountsTemplate.usageOptions;
    });
  }

  /**
   * Creates and sets gl account form.
   */
  ngOnInit() {
    this.createGlAccountForm();
    this.setGLAccountForm();
  }

  /**
   * Creates gl account form.
   */
  createGlAccountForm() {
    this.glAccountForm = this.formBuilder.group({
      'type': ['', Validators.required],
      'name': ['', Validators.required],
      'usage': ['', Validators.required],
      'glCode': ['', Validators.required],
      'parentId': [this.parentId || undefined],
      'tagId': [''],
      'manualEntriesAllowed': [true, Validators.required],
      'description': ['']
    });
  }

  /**
   * Sets gl account form for selected account type.
   */
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

    this.glAccountForm.get('type').setValue(this.accountTypeId);
  }

  /**
   * Submits the gl account form and creates gl account,
   * if successful redirects to view created account.
   */
  submit() {
    this.accountingService.createGlAccount(this.glAccountForm.value).subscribe((response: any) => {
      if (this.configurationWizardService.showChartofAccounts === true) {
        this.configurationWizardService.showChartofAccounts = false;
        this.openDialog();
      } else {
        this.router.navigate(['../view', response.resourceId], { relativeTo: this.route });
      }
    });
  }

  /**
   * Popover function
   * @param template TemplateRef<any>.
   * @param target HTMLElement | ElementRef<any>.
   * @param position String.
   * @param backdrop Boolean.
   */
  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  /**
   * To show popover.
   */
  ngAfterViewInit() {
    if (this.configurationWizardService.showChartofAccountsForm === true) {
      setTimeout(() => {
        this.showPopover(this.templateAccountFormRef, this.accountFormRef.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Next Step (Accounts Linked Accounting Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showChartofAccountsForm = false;
    this.configurationWizardService.showAccountsLinked = true;
    this.router.navigate(['/accounting']);
  }

  /**
   * Previous Step (Charts of Accounts Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showChartofAccountsForm = false;
    this.configurationWizardService.showChartofAccountsList = true;
    this.router.navigate(['/accounting/chart-of-accounts']);
  }

  /**
   * Opens dialog if the user wants to create more accounts.
   */
  openDialog() {
  const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
    data: {
      stepName: 'GL account'
    },
  });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
      if (response.step === 1) {
          this.configurationWizardService.showChartofAccountsForm = false;
          this.router.navigate(['../'], { relativeTo: this.route });
        } else if (response.step === 2) {
          this.configurationWizardService.showChartofAccountsForm = true;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate(['/accounting/chart-of-accounts/gl-accounts/create']);
        } else if (response.step === 3) {
          this.configurationWizardService.showChartofAccountsForm = false;
          this.configurationWizardService.showAccountsLinked = true;
          this.router.navigate(['/accounting']);
        }
    });
  }
}
