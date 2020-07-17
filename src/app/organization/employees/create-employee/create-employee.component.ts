/** Angular Imports */
import { Component, OnInit , TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { DatePipe } from '@angular/common';
import { MatDialog } from '@angular/material';

/** Custom Services */
import { OrganizationService } from '../../organization.service';
import { PopoverService } from '../../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Component */
import { ContinueSetupDialogComponent } from '../../../configuration-wizard/continue-setup-dialog/continue-setup-dialog.component';

/**
 * Create employee component.
 */
@Component({
  selector: 'mifosx-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss']
})
export class CreateEmployeeComponent implements OnInit, AfterViewInit {

  /** Minimum joining date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum joining date allowed. */
  maxDate = new Date();
  /** Employee form. */
  employeeForm: FormGroup;
  /** Office data. */
  officeData: any;

  /* Reference of employee form */
  @ViewChild('createEmployeeFormRef') createEmployeeFormRef: ElementRef<any>;
  /* Template for popover on employee form */
  @ViewChild('templateCreateEmployeeForm') templateCreateEmployeeForm: TemplateRef<any>;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   * @param {MatDialog} dialog MatDialog.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private route: ActivatedRoute,
              private router: Router,
              private datePipe: DatePipe,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Creates the employee form.
   */
  ngOnInit() {
    this.createEmployeeForm();
  }

  /**
   * Creates the employee form.
   */
  createEmployeeForm() {
    this.employeeForm = this.formBuilder.group({
      'officeId': ['', Validators.required],
      'firstname': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'lastname': ['', [Validators.required, Validators.pattern('(^[A-z]).*')]],
      'isLoanOfficer': [false],
      'mobileNo': [''],
      'joiningDate': ['', Validators.required],
    });
  }

  /**
   * Submits the employee form and creates employee,
   * if successful redirects to employees.
   */
  submit() {
    const prevJoiningDate: Date = this.employeeForm.value.joiningDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.employeeForm.patchValue({
      joiningDate: this.datePipe.transform(prevJoiningDate, dateFormat)
    });
    const employee = this.employeeForm.value;
    employee.locale = 'en';
    employee.dateFormat = dateFormat;
    this.organizationService.createEmployee(employee).subscribe((response: any) => {
      if (this.configurationWizardService.showEmployeeForm === true) {
        this.configurationWizardService.showEmployeeForm = false;
        this.openDialog();
      } else {
        this.router.navigate(['../'], { relativeTo: this.route });
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
    if (this.configurationWizardService.showEmployeeForm === true) {
      setTimeout(() => {
          this.showPopover(this.templateCreateEmployeeForm, this.createEmployeeFormRef.nativeElement, 'right', true);
      });
    }
  }

  /**
   * Next Step (Define Working Days) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showEmployeeForm = false;
    this.configurationWizardService.showDefineWorkingDays = true;
    this.router.navigate(['/organization']);
  }

  /**
   * Previous Step (Employees Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showEmployeeForm = false;
    this.configurationWizardService.showEmployeeTable = true;
    this.router.navigate(['/organization/employees']);
  }

  /**
   * Opens dialog if the user wants to create more employees.
   */
  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'employee'
      },
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
      if (response.step === 1) {
        this.configurationWizardService.showEmployeeForm = false;
        this.router.navigate(['../'], { relativeTo: this.route });
      } else if (response.step === 2) {
        this.configurationWizardService.showEmployeeForm = true;
        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = 'reload';
        this.router.navigate(['/organization/employees/create']);
      } else if (response.step === 3) {
        this.configurationWizardService.showEmployeeForm = false;
        this.configurationWizardService.showDefineWorkingDays = true;
        this.router.navigate(['/organization']);
      }
    });
  }

}
