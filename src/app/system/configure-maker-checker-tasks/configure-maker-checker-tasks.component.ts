import { Component, OnInit } from '@angular/core';
import { constructor } from 'lodash';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as _ from 'lodash';
import { SystemService } from '../system.service';

@Component({
  selector: 'mifosx-configure-maker-checker-tasks',
  templateUrl: './configure-maker-checker-tasks.component.html',
  styleUrls: ['./configure-maker-checker-tasks.component.scss']
})
export class ConfigureMakerCheckerTasksComponent implements OnInit {

  permissionsData: any;
  groupings: string[] = [];
  formData = {};
  isDisabled = true;
  newEntry: any;
  selectedItem = '';
  previousGrouping = '';
  checkboxesChanged: Boolean = false;
  currentGrouping: string;
  formGroup: FormGroup;
  backupform: FormGroup;

  permissions: {
    permissions: { code: string, id: number }[]
  };
  tempPermissionUIData: {
    permissions: { code: string }[]
  }[];

  constructor(private route: ActivatedRoute,
    private systemService: SystemService,
    private formBuilder: FormBuilder, ) {
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

  createMemberGroup(permission: any): FormGroup {
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
    this.backupform = _.cloneDeep(this.formGroup) as FormGroup;
  }

  /**
   * Restores the checkboxes to previous data on clicking cancel
   */
  restoreCheckboxes() {
    this.formGroup = _.cloneDeep(this.backupform) as FormGroup;
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

}
