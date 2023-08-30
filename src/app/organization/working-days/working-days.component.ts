/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, UntypedFormArray, UntypedFormControl } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { OrganizationService } from '../organization.service';
import { SettingsService } from 'app/settings/settings.service';
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';

/** Custom Dialog Components */
import { NextStepDialogComponent } from '../../configuration-wizard/next-step-dialog/next-step-dialog.component';

/** Recurrence default value. */
const recurrenceDefaultValue = 'FREQ=WEEKLY;INTERVAL=1;BYDAY=';

/**
 * Working days component.
 */
@Component({
  selector: 'mifosx-working-days',
  templateUrl: './working-days.component.html',
  styleUrls: ['./working-days.component.scss']
})
export class WorkingDaysComponent implements OnInit, AfterViewInit {

  /** Working days form. */
  workingDaysForm: UntypedFormGroup;
  /** Working days data. */
  workingDaysData: any;
  /** Week days */
  weekDays = [
    { name: 'Monday', value: 'MO', checked: false },
    { name: 'Tuesday', value: 'TU', checked: false },
    { name: 'Wednesday', value: 'WE', checked: false },
    { name: 'Thursday', value: 'TH', checked: false },
    { name: 'Friday', value: 'FR', checked: false },
    { name: 'Saturday', value: 'SA', checked: false },
    { name: 'Sunday', value: 'SU', checked: false }
  ];
  /**  Repayment schedule type data. */
  repaymentRescheduleTypeData: any;

  /* Reference of define working days form */
  @ViewChild('workingDaysFormRef') workingDaysFormRef: ElementRef<any>;
  /* Template for popover on define working days form */
  @ViewChild('templateWorkingDaysFormRef') templateWorkingDaysFormRef: TemplateRef<any>;

  /**
   * Retrieves the working days data from `resolve`.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {ActivatedRoute} route Activated Route.
   * @param {OrganizationService} organizationService Organization Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {Router} router Router for navigation.
   * @param {MatDialog} dialog MatDialog.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private formBuilder: UntypedFormBuilder,
              private route: ActivatedRoute,
              private organizationService: OrganizationService,
              private settingsService: SettingsService,
              private router: Router,
              private dialog: MatDialog,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) {
    this.route.data.subscribe((data: { workingDays: any }) => {
      this.workingDaysData = data.workingDays;
    });
  }

  /**
   * Creates the working days form.
   */
  ngOnInit() {
    this.createWorkingDaysForm();
  }

  /**
   * Creates the working days form.
   */
  createWorkingDaysForm() {
    this.setWeeklyWorkingDays();
    this.repaymentRescheduleTypeData = this.workingDaysData.repaymentRescheduleOptions;
    this.workingDaysForm = this.formBuilder.group({
      'recurrence': this.formBuilder.array(this.createRecurrenceFormArray()),
      'repaymentRescheduleType': [this.workingDaysData.repaymentRescheduleType.id],
      'extendTermForDailyRepayments': [this.workingDaysData.extendTermForDailyRepayments]
    });
  }

  /**
   * @returns {FormArray} recurrence form array.
   */
  get recurrence(): UntypedFormArray {
    return this.workingDaysForm.get('recurrence') as UntypedFormArray;
  }

  /**
   * Sets weekly working days.
   */
  setWeeklyWorkingDays() {
    const days = this.workingDaysData.recurrence.replace(recurrenceDefaultValue, '');
    for (let i = 0; i < this.weekDays.length; i++) {
      this.weekDays[i].checked = days.includes(this.weekDays[i].value);
    }
  }

  /**
   * Creates the recurrence form array.
   */
  createRecurrenceFormArray() {
    return this.weekDays.map(weekDay => new UntypedFormControl(weekDay.checked));
  }

  /**
   * Submits the working days form and updates working days configuration,
   * if successful redirects to organization view.
   */
  submit() {
    const workingDays = this.workingDaysForm.value;
    // TODO: Update once language and date settings are setup
    workingDays.locale = this.settingsService.language.code;
    let recurrence = recurrenceDefaultValue;
    for (let i = 0; i < this.weekDays.length; i++) {
      if (workingDays.recurrence[i]) {
        recurrence = recurrence + this.weekDays[i].value + ',';
      }
    }
    workingDays.recurrence = recurrence;
    this.organizationService.updateWorkingDays(workingDays).subscribe(response => {
      if (this.configurationWizardService.showDefineWorkingDays === true) {
        this.configurationWizardService.showDefineWorkingDays = false;
        this.openNextStepDialog();
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
    if (this.configurationWizardService.showDefineWorkingDays === true) {
      setTimeout(() => {
          this.showPopover(this.templateWorkingDaysFormRef, this.workingDaysFormRef.nativeElement, 'right', true);
      });
    }
  }

  /**
   * Open Dialog for next step.
   * Next Step (System) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showDefineWorkingDays = false;
    this.openNextStepDialog();
  }

  /**
   * Previous Step (Organization Page) Configuration Wizard.
   */
  previousStep() {
    this.router.navigate(['/organization']);
  }

  /**
   * Next Step (System) Dialog Configuration Wizard.
   */
  openNextStepDialog() {
    const nextStepDialogRef = this.dialog.open( NextStepDialogComponent, {
      data: {
        nextStepName: 'Setup System',
        previousStepName: 'Organization',
        stepPercentage: 30
      },
    });
    nextStepDialogRef.afterClosed().subscribe((response: { nextStep: boolean }) => {
    if (response.nextStep) {
      this.configurationWizardService.showDefineWorkingDays = false;
      this.configurationWizardService.showDatatables = true;
      this.router.navigate(['/system']);
      } else {
      this.configurationWizardService.showDefineWorkingDays = false;
      this.router.navigate(['/home']);
      }
    });
  }
}
