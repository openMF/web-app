/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef , ViewChild,
         AfterViewInit } from '@angular/core';
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
 * Create Office component.
 */
@Component({
  selector: 'mifosx-create-office',
  templateUrl: './create-office.component.html',
  styleUrls: ['./create-office.component.scss']
})
export class CreateOfficeComponent implements OnInit, AfterViewInit {

  /** Office form. */
  officeForm: FormGroup;
  /** Office Data */
  officeData: any;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();

  /* Reference of create office form */
  @ViewChild('createOfficeFormRef') createOfficeFormRef: ElementRef<any>;
  /* template for popover on create office form */
  @ViewChild('templateCreateOfficeForm') templateCreateOfficeForm: TemplateRef<any>;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {DatePipe} datePipe Date Pipe to format date.
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private formBuilder: FormBuilder,
              private organizationService: OrganizationService,
              private router: Router,
              private route: ActivatedRoute,
              private datePipe: DatePipe,
              private popoverService: PopoverService,
              private configurationWizardService: ConfigurationWizardService,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  ngOnInit() {
    this.createofficeForm();
  }

  /**
   * Creates the Office Form
   */
  createofficeForm() {
    this.officeForm = this.formBuilder.group({
      'name': ['', Validators.required],
      'parentId': ['', Validators.required],
      'openingDate': ['', Validators.required],
      'externalId': [''],
    });
  }

  /**
   * Submits the office form and creates office.
   * if successful redirects to offices
   */
  submit() {
    const prevOpeningDate: Date = this.officeForm.value.openingDate;
    // TODO: Update once language and date settings are setup
    const dateFormat = 'yyyy-MM-dd';
    this.officeForm.patchValue({
      openingDate: this.datePipe.transform(prevOpeningDate, dateFormat)
    });
    const office = this.officeForm.value;
    office.locale = 'en';
    office.dateFormat = dateFormat;
    this.organizationService.createOffice(office).subscribe(response => {
      if (this.configurationWizardService.showOfficeForm === true) {
        this.configurationWizardService.showOfficeForm = false;
        this.openDialog();
      } else {
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  /**
   * Opens dialog if users wants to create more offices.
   */
  openDialog() {
    const continueSetupDialogRef = this.dialog.open(ContinueSetupDialogComponent, {
      data: {
        stepName: 'office'
      },
    });
    continueSetupDialogRef.afterClosed().subscribe((response: { step: number }) => {
      if (response.step === 1) {
          this.configurationWizardService.showOfficeForm = false;
          this.router.navigate(['../'], { relativeTo: this.route });
        } else if (response.step === 2) {
          this.configurationWizardService.showOfficeForm = true;
          this.router.routeReuseStrategy.shouldReuseRoute = () => false;
          this.router.onSameUrlNavigation = 'reload';
          this.router.navigate(['/organization/offices/create']);
        } else if (response.step === 3) {
          this.configurationWizardService.showOfficeForm = false;
          this.configurationWizardService.showAddEditCurrency = true;
          this.router.navigate(['/organization']);
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
    if (this.configurationWizardService.showOfficeForm === true) {
      setTimeout(() => {
          this.showPopover(this.templateCreateOfficeForm, this.createOfficeFormRef.nativeElement, 'right', true);
      });
    }
  }

  /**
   * Next Step (Add Edit Currency) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showOfficeForm = false;
    this.configurationWizardService.showAddEditCurrency = true;
    this.router.navigate(['/organization']);
  }

  /**
   * Previous Step (Manage Offices Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showOfficeForm = false;
    this.configurationWizardService.showOfficeTable = true;
    this.router.navigate(['/organization/offices']);
  }
}
