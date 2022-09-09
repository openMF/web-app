/** Angular Imports */
import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';

/** Custom Services */
import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';

@Component({
  selector: 'mifosx-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit, AfterViewInit {

  /* Reference of manage datatables */
  @ViewChild('datatables') datatables: ElementRef<any>;
  /* Template for popover on manage datables */
  @ViewChild('templateDatatables') templateDatatables: TemplateRef<any>;
  /* Reference of manage codes */
  @ViewChild('codes') codes: ElementRef<any>;
  /* Template for popover on manage codes */
  @ViewChild('templateCodes') templateCodes: TemplateRef<any>;
  /* Reference of roles and permission */
  @ViewChild('rolesandpermission') rolesandpermission: ElementRef<any>;
  /* Template for popover on roles and permission */
  @ViewChild('templateRolesandPermission') templateRolesandPermission: TemplateRef<any>;
  /* Reference of makerchecker tasks */
  @ViewChild('makerCheckerTable') makerCheckerTable: ElementRef<any>;
  /* Template for popover on maker checker tasks */
  @ViewChild('templateMakerCheckerTable') templateMakerCheckerTable: TemplateRef<any>;
  /* Reference of global configurations */
  @ViewChild('configurations') configurations: ElementRef<any>;
  /* Template for popover on configurations */
  @ViewChild('templateConfigurations') templateConfigurations: TemplateRef<any>;
  /* Reference of scheduler jobs */
  @ViewChild('schedulerJobs') schedulerJobs: ElementRef<any>;
  /* Template for popover on scheduler jobs */
  @ViewChild('templateSchedulerJobs') templateSchedulerJobs: TemplateRef<any>;
  /* Reference of manage reports */
  @ViewChild('manageReports') manageReports: ElementRef<any>;
  /* Template for popover on manage reports */
  @ViewChild('templateManageReports') templateManageReports: TemplateRef<any>;

  /**
   * @param {Router} router Router.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) { }

  ngOnInit() {
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
    if (this.configurationWizardService.showDatatables === true) {
      setTimeout(() => {
        this.showPopover(this.templateDatatables, this.datatables.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showSystemCodes === true) {
      setTimeout(() => {
        this.showPopover(this.templateCodes, this.codes.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showRolesandPermission === true) {
      setTimeout(() => {
        this.showPopover(this.templateRolesandPermission, this.rolesandpermission.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showMakerCheckerTable === true) {
      setTimeout(() => {
        this.showPopover(this.templateMakerCheckerTable, this.makerCheckerTable.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showConfigurations === true) {
      setTimeout(() => {
        this.showPopover(this.templateConfigurations, this.configurations.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showSchedulerJobs === true) {
      setTimeout(() => {
        this.showPopover(this.templateSchedulerJobs, this.schedulerJobs.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showManageReports === true) {
      setTimeout(() => {
        this.showPopover(this.templateManageReports, this.manageReports.nativeElement, 'bottom', true);
      });
    }
  }

  /**
   * Next Step (Manage Datatables Page) Configuration Wizard.
   */
  nextStepDatatables() {
    this.configurationWizardService.showDatatables = false;
    this.configurationWizardService.showDatatablesPage = true;
    this.router.navigate(['/system/data-tables']);
  }

  /**
   * Previous Step (Define working days Page) Configuration Wizard.
   */
  previousStepDatatables() {
    this.configurationWizardService.showDatatables = false;
    this.configurationWizardService.showDefineWorkingDays = true;
    this.router.navigate(['/organization/working-days']);
  }

  /**
   * Next Step (Manage Codes Page) Configuration Wizard.
   */
  nextStepCodes() {
    this.configurationWizardService.showSystemCodes = false;
    this.configurationWizardService.showSystemCodesPage  = true;
    this.router.navigate(['/system/codes']);
  }

  /**
   * Previous Step (Create Datatables Page) Configuration Wizard.
   */
  previousStepCodes() {
    this.configurationWizardService.showSystemCodes = false;
    this.configurationWizardService.showDatatablesForm = true;
    this.router.navigate(['/system/data-tables/create']);
  }

  /**
   * Next Step (Manage Roles and Permission Page) Configuration Wizard.
   */
  nextStepRolesandPermission() {
    this.configurationWizardService.showRolesandPermission = false;
    this.configurationWizardService.showRolesandPermissionPage = true;
    this.router.navigate(['/system/roles-and-permissions']);
  }

  /**
   * Previous Step (Create Codes Page) Configuration Wizard.
   */
  previousStepRolesandPermission() {
    this.configurationWizardService.showRolesandPermission = false;
    this.configurationWizardService.showSystemCodesForm = true;
    this.router.navigate(['/system/codes/create']);
  }

  /**
   * Next Step (Maker Checker Tasks Page) Configuration Wizard.
   */
  nextStepMakerCheckerTable() {
    this.configurationWizardService.showMakerCheckerTable = false;
    this.configurationWizardService.showMakerCheckerTablePage = true;
    this.router.navigate(['/system/configure-mc-tasks']);
  }

  /**
   * Previous Step (Create User Page) Configuration Wizard.
   */
  previousStepMakerCheckerTable() {
    this.configurationWizardService.showMakerCheckerTable = false;
    this.configurationWizardService.showUsersForm = true;
    this.router.navigate(['/users/create']);
  }

  /**
   * Next Step (Configurations Page) Configuration Wizard.
   */
  nextStepConfigurations() {
    this.configurationWizardService.showConfigurations = false;
    this.configurationWizardService.showConfigurationsPage = true;
    this.router.navigate(['/system/configurations']);
  }

  /**
   * Previous Step (Makerchecker Tasks Page) Configuration Wizard.
   */
  previousStepConfigurations() {
    this.configurationWizardService.showConfigurations = false;
    this.configurationWizardService.showMakerCheckerTableList = true;
    this.router.navigate(['/system/configure-mc-tasks']);
  }

  /**
   * Next Step (Manage Scheduler Jobs Page) Configuration Wizard.
   */
  nextStepSchedulerJobs() {
    this.configurationWizardService.showSchedulerJobs = false;
    this.configurationWizardService.showSchedulerJobsPage = true;
    this.router.navigate(['/system/scheduler-jobs']);
  }

  /**
   * Previous Step (Global Configurations Page) Configuration Wizard.
   */
  previousStepSchedulerJobs() {
    this.configurationWizardService.showSchedulerJobs = false;
    this.configurationWizardService.showConfigurationsList = true;
    this.router.navigate(['/system/global-configurations']);
  }

  /**
   * Next Step (Manage Reports Page) Configuration Wizard.
   */
  nextStepManageReports() {
    this.router.navigate(['/system/reports']);
  }

  /**
   * Previous Step (Manage Funds Page) Configuration Wizard.
   */
  previousStepManageReports() {
    this.configurationWizardService.showManageReports = false;
    this.configurationWizardService.showManageFunds = true;
    this.router.navigate(['/organization/manage-funds']);
  }
}
