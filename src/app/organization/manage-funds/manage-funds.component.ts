/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormBuilder, Validators } from '@angular/forms';

/** Custom Dialogs */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { ContinueSetupDialogComponent } from '../../configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';

/**
 * Manage Funds component.
 */
@Component({
  selector: 'mifosx-manage-funds',
  templateUrl: './manage-funds.component.html',
  styleUrls: ['./manage-funds.component.scss']
})
export class ManageFundsComponent implements OnInit, AfterViewInit {

  /** Manage Funds data. */
  fundsData: any;
  /** New Fund form */
  fundForm: any;
  /** Funds form reference */
  @ViewChild('formRef') formRef: any;
  @ViewChild('fundFormRef') fundFormRef: ElementRef<any>;
  @ViewChild('templateFundFormRef') templateFundFormRef: TemplateRef<any>;

  /**
   * Retrieves the manage funds data from `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {FormBuilder} formBuilder Form Builder
   * @param {OrganizationService} organizationservice Organization Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private organizationservice: OrganizationService,
              public dialog: MatDialog,
              private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe(( data: { funds: any }) => {
      this.fundsData = data.funds;
    });
  }

  ngOnInit() {
    this.createFundForm();
  }

  /**
   * Creates the fund form.
   */
  createFundForm() {
    this.fundForm = this.formBuilder.group({
      'name': ['', Validators.required]
    });
  }

  /**
   * Adds a new fund to the list.
   */
  addFund() {
    const newFund = this.fundForm.value;
    this.organizationservice.createFund(newFund).subscribe((response: any) => {
        this.fundsData.push({
          id: response.resourceId,
          name: newFund.name
        });
      this.formRef.resetForm();
      if (this.configurationWizardService.showManageFunds === true) {
        this.configurationWizardService.showManageFunds = false;
        this.openDialog();
      }
    });
  }

  /**
   * Edits the selected fund.
   * @param {string} fundId Fund Id.
   * @param {string} fundContent Fund's content.
   * @param {number} index  Index of fund.
   */
  editFund(fundId: string, fundContent: string, index: number) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'name',
        label: 'Fund Content',
        value: fundContent,
        type: 'text',
        required: true
      }),
    ];
    const data = {
      title: 'Edit Fund',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editFundDialogRef = this.dialog.open(FormDialogComponent, { data });
    editFundDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.organizationservice.editFund(fundId, response.data.value).subscribe(() => {
          this.fundsData[index].name = response.data.value.name;
        });
      }
    });
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

  ngAfterViewInit() {
    if (this.configurationWizardService.showManageFunds === true) {
      setTimeout(() => {
          this.showPopover(this.templateFundFormRef, this.fundFormRef.nativeElement, 'bottom', true);
      });
    }
  }

  previousStep() {
    this.router.navigate(['/organization']);
  }

  nextStep() {
    this.configurationWizardService.showManageFunds = false;
    this.configurationWizardService.showManageReports = true;
    this.router.navigate(['/system']);
  }

  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'fund'
      },
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
    if (response.step === 1) {
        this.configurationWizardService.showManageFunds = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      } else if (response.step === 2) {
        this.configurationWizardService.showManageFunds = true;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/organization/manage-funds']);
      } else if (response.step === 3) {
        this.configurationWizardService.showManageFunds = false;
        this.configurationWizardService.showManageReports = true;
        this.router.navigate(['/system']);
      }
    });
  }
}
