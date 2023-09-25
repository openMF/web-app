import { Component, OnInit, TemplateRef, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';

/** Custom Services */
import { PopoverService } from '../../configuration-wizard/popover/popover.service';
import { ConfigurationWizardService } from '../../configuration-wizard/configuration-wizard.service';
import { SystemService } from '../system.service';

@Component({
  selector: 'mifosx-configure-maker-checker-tasks',
  templateUrl: './configure-maker-checker-tasks.component.html',
  styleUrls: ['./configure-maker-checker-tasks.component.scss']
})
export class ConfigureMakerCheckerTasksComponent implements OnInit, AfterViewInit {

  permissionsData: any;
  groupings: string[] = [];
  formData = {};
  isDisabled = true;
  newEntry: any;
  selectedItem = '';
  previousGrouping = '';
  checkboxesChanged: Boolean = false;
  currentGrouping: string;
  formGroup: UntypedFormGroup;
  backupform: UntypedFormGroup;

  permissions: {
    permissions: { code: string, id: number }[]
  };
  tempPermissionUIData: {
    permissions: { code: string }[]
  }[];

  /* Reference of edit button */
  @ViewChild('buttonEdit') buttonEdit: ElementRef<any>;
  /* Template for popover on edit button */
  @ViewChild('templateButtonEdit') templateButtonEdit: TemplateRef<any>;
  /* Reference of maker checker taks table */
  @ViewChild('mcTable') mcTable: ElementRef<any>;
  /* Template for popover on maker checker taks table */
  @ViewChild('templateMcTable') templateMcTable: TemplateRef<any>;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {SystemService} systemService Accounting Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {ConfigurationWizardService} configurationWizardService ConfigurationWizard Service.
   * @param {PopoverService} popoverService PopoverService.
   */
  constructor(private route: ActivatedRoute,
    private systemService: SystemService,
    private formBuilder: UntypedFormBuilder,
    private router: Router,
    private configurationWizardService: ConfigurationWizardService,
    private popoverService: PopoverService ) {
    this.route.data.subscribe((data: { permissions: any }) => {
      this.permissionsData = data.permissions;
    });
  }

  ngOnInit() {
    this.createForm();
    this.setMakerCheckerTask();
    this.selectedItem = 'portfolio';
    this.showPermissions('portfolio');
  }

  /**
   * creates the form to display and edit permissions
   */
  createForm() {
    this.formGroup = this.formBuilder.group({
      roster: this.formBuilder.array(this.permissionsData.map((elem: any) => this.createMemberGroup(elem)))
    });
  }

  createMemberGroup(permission: any): UntypedFormGroup {
    return this.formBuilder.group({
      ...permission,
      ...{
        code: [permission.code, Validators.required],
        selected: [{ value: permission.selected, disabled: true }, Validators.required]
      }
    });
  }

  setMakerCheckerTask() {
    this.tempPermissionUIData = [{
      permissions: []
    }];
    for (const i in this.permissionsData) {
      if (this.permissionsData[i]) {
        if (this.permissionsData[i].grouping !== this.currentGrouping) {
          this.currentGrouping = this.permissionsData[i].grouping;
          this.groupings.push(this.currentGrouping);
          this.tempPermissionUIData[this.currentGrouping] = { permissions: [] };
        }
        const temp = { code: this.permissionsData[i].code, id: i, selected: this.permissionsData[i].selected };
        this.tempPermissionUIData[this.currentGrouping].permissions.push(temp);
      }
    }
  }

  showPermissions(grouping: string) {
    this.permissions = this.tempPermissionUIData[grouping];
    this.selectedItem = grouping;
    this.previousGrouping = grouping;
  }


  permissionName = function (name: any) {
    name = name || '';
    // replace '_' with ' '
    name = name.replace(/_/g, ' ');
    // for reorts replace read with view
    if (this.previousGrouping === 'report') {
      name = name.replace(/READ/g, 'View');
    }
    return name;
  };

  formatName = function (stringVal: string) {
    stringVal = stringVal || '';
    if (stringVal.indexOf('portfolio_') > -1) {
      stringVal = stringVal.replace('portfolio_', '');
    }
    if (stringVal.indexOf('transaction_') > -1) {
      const temp = stringVal.split('_');
      stringVal = temp[1] + ' ' + temp[0].charAt(0).toUpperCase() + temp[0].slice(1) + 's';
    }
    stringVal = stringVal.charAt(0).toUpperCase() + stringVal.slice(1);
    return stringVal;
  };

  /**
   * Backups the valued
   */
  backupCheckValues() {
    this.backupform = _.cloneDeep(this.formGroup) as UntypedFormGroup;
  }

  /**
   * Restores the checkboxes to previous data on clicking cancel
   */
  restoreCheckboxes() {
    this.formGroup = _.cloneDeep(this.backupform) as UntypedFormGroup;
  }

  isTaskEnable(value: any) {
    return value;
  }

  editTask() {
    this.isDisabled = false;
    this.formGroup.controls.roster.enable();
  }

  /**
   * Cancel the changes
   */
  cancel() {
    this.isDisabled = true;
    this.formGroup.controls.roster.disable();
  }

  submit() {
    const value = this.formGroup.get('roster').value;
    const data = {};
    const permissionData = {
      permissions: {}
    };
    for (let i = 0; i < value.length; i++ ) {
      data[value[i].code] = value[i].selected;
    }
    permissionData.permissions = data;
    this.formGroup.controls.roster.disable();
    this.checkboxesChanged = false;
    this.isDisabled = true;
    this.systemService.updateMakerCheckerPermission(permissionData).subscribe((response: any) => {
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
    if (this.configurationWizardService.showMakerCheckerTablePage === true) {
      setTimeout(() => {
          this.showPopover(this.templateButtonEdit, this.buttonEdit.nativeElement, 'bottom', true);
      });
    }
    if (this.configurationWizardService.showMakerCheckerTableList === true) {
      setTimeout(() => {
          this.showPopover(this.templateMcTable, this.mcTable.nativeElement, 'top', true);
      });
    }
  }

  /**
   * Next Step (Global Configurations System Page) Configuration Wizard.
   */
  nextStep() {
    this.configurationWizardService.showMakerCheckerTablePage = false;
    this.configurationWizardService.showMakerCheckerTableList = false;
    this.configurationWizardService.showConfigurations = true;
    this.router.navigate(['/system']);
  }

  /**
   * Previous Step (Maker Checker Tasks System Page) Configuration Wizard.
   */
  previousStep() {
    this.configurationWizardService.showMakerCheckerTablePage = false;
    this.configurationWizardService.showMakerCheckerTableList = false;
    this.configurationWizardService.showMakerCheckerTable = true;
    this.router.navigate(['/system']);
  }
}
