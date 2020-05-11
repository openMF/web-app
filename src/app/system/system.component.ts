import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';

import { Router } from '@angular/router';

import { PopoverService } from '../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../configuration-wizard/configuration-wizard.service';

@Component({
  selector: 'mifosx-system',
  templateUrl: './system.component.html',
  styleUrls: ['./system.component.scss']
})
export class SystemComponent implements OnInit, AfterViewInit {

  @ViewChild('datatables') datatables: ElementRef<any>;
  @ViewChild('templateDatatables') templateDatatables: TemplateRef<any>;
  @ViewChild('codes') codes: ElementRef<any>;
  @ViewChild('templateCodes') templateCodes: TemplateRef<any>;
  @ViewChild('rolesandpermission') rolesandpermission: ElementRef<any>;
  @ViewChild('templateRolesandPermission') templateRolesandPermission: TemplateRef<any>;
  @ViewChild('makerCheckerTable') makerCheckerTable: ElementRef<any>;
  @ViewChild('templateMakerCheckerTable') templateMakerCheckerTable: TemplateRef<any>;
  @ViewChild('configurations') configurations: ElementRef<any>;
  @ViewChild('templateConfigurations') templateConfigurations: TemplateRef<any>;
  @ViewChild('schedulerJobs') schedulerJobs: ElementRef<any>;
  @ViewChild('templateSchedulerJobs') templateSchedulerJobs: TemplateRef<any>;
  @ViewChild('manageReports') manageReports: ElementRef<any>;
  @ViewChild('templateManageReports') templateManageReports: TemplateRef<any>;

  constructor(private router: Router,
              private configurationWizardService: ConfigurationWizardService,
              private popoverService: PopoverService) { }

  ngOnInit() {
  }

  showPopover(template: TemplateRef<any>, target: HTMLElement | ElementRef<any>, position: string, backdrop: boolean): void {
    setTimeout(() => this.popoverService.open(template, target, position, backdrop, {}), 200);
  }

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

  nextStepDatatables() {
    this.configurationWizardService.showDatatables = false;
    this.configurationWizardService.showDatatablesPage = true;
    this.router.navigate(['/system/data-tables']);
  }

  previousStepDatatables() {
    this.configurationWizardService.showDatatables = false;
    this.configurationWizardService.showDefineWorkingDays = true;
    this.router.navigate(['/organization/working-days']);
  }

  nextStepCodes() {
    this.configurationWizardService.showSystemCodes = false;
    this.configurationWizardService.showSystemCodesPage  = true;
    this.router.navigate(['/system/codes']);
  }

  previousStepCodes() {
    this.configurationWizardService.showSystemCodes = false;
    this.configurationWizardService.showDatatablesForm = true;
    this.router.navigate(['/system/data-tables/create']);
  }

  nextStepRolesandPermission() {
    this.configurationWizardService.showRolesandPermission = false;
    this.configurationWizardService.showRolesandPermissionPage = true;
    this.router.navigate(['/system/roles-and-permissions']);
  }

  previousStepRolesandPermission() {
    this.configurationWizardService.showRolesandPermission = false;
    this.configurationWizardService.showSystemCodesForm = true;
    this.router.navigate(['/system/codes/create']);
  }

  nextStepMakerCheckerTable() {
    this.configurationWizardService.showMakerCheckerTable = false;
    this.configurationWizardService.showMakerCheckerTablePage = true;
    this.router.navigate(['/system/configure-mc-tasks']);
  }

  previousStepMakerCheckerTable() {
    this.configurationWizardService.showMakerCheckerTable = false;
    this.configurationWizardService.showUsersForm = true;
    this.router.navigate(['/users/create']);
  }

  nextStepConfigurations() {
    this.configurationWizardService.showConfigurations = false;
    this.configurationWizardService.showConfigurationsPage = true;
    this.router.navigate(['/system/global-configurations']);
  }

  previousStepConfigurations() {
    this.configurationWizardService.showConfigurations = false;
    this.configurationWizardService.showMakerCheckerTableList = true;
    this.router.navigate(['/system/configure-mc-tasks']);
  }

  nextStepSchedulerJobs() {
    this.configurationWizardService.showSchedulerJobs = false;
    this.configurationWizardService.showSchedulerJobsPage = true;
    this.router.navigate(['/system/scheduler-jobs']);
  }

  previousStepSchedulerJobs() {
    this.configurationWizardService.showSchedulerJobs = false;
    this.configurationWizardService.showConfigurationsList = true;
    this.router.navigate(['/system/global-configurations']);
  }

  nextStepManageReports() {
    this.router.navigate(['/system/reports']);
  }

  previousStepManageReports() {
    this.configurationWizardService.showManageReports = false;
    this.configurationWizardService.showManageFunds = true;
    this.router.navigate(['/organization/manage-funds']);
  }
}
