/** Angular Imports  */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, FormArray, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import * as _ from 'lodash';
import { RolesService } from '@fineract/client';

/** Custom Components */
import { TranslateService } from '@ngx-translate/core';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { DisableDialogComponent } from '../../../shared/disable-dialog/disable-dialog.component';
import { EnableDialogComponent } from '../../../shared/enable-dialog/enable-dialog.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { MatList, MatListItem } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';
import { MatCheckbox } from '@angular/material/checkbox';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Service Zitadel */
import { environment } from '../../../../environments/environment';
import { AuthService } from 'app/zitadel/auth.service';

/**
 * View Role and Permissions Component
 */
@Component({
  selector: 'mifosx-view-role',
  templateUrl: './view-role.component.html',
  styleUrls: ['./view-role.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatList,
    MatListItem,
    NgClass,
    MatDivider,
    MatCheckbox
  ]
})
export class ViewRoleComponent implements OnInit {
  /** Role Permissions Data */
  rolePermissionService: any;
  /** Stores the current grouping */
  currentGrouping: string;
  /** Stores the previous grouping */
  previousGrouping = '';
  /** Stores Grouping Data */
  groupings: string[] = [];
  /** Stores the selected role */
  selectedItem = '';
  /** Checks if its disabled */
  isDisabled: Boolean = true;
  /** Checks if there is any change in data */
  checkboxesChanged: Boolean = false;
  /** Stores backup values */
  bValuesOnly: string[] = [];
  /** Role ID */
  roleId: any;
  /** Creates permission form  */
  formGroup: UntypedFormGroup;
  /** Creates Backup form */
  backupform: UntypedFormGroup;
  /** Temporarily stores Permission data */
  tempPermissionUIData: {
    [key: string]: {
      permissions: { code: string; id: number; selected?: boolean }[];
    };
  } = {};
  /** Stores permissions */
  permissions: {
    permissions: { code: string; id: number }[];
  } = { permissions: [] };
  /** Add role zitadel */

  /**
   * Retrieves the roledetails data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {RolesService} rolesService Roles Service.
   * @param {Router} router Router for navigation.
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {MatDialog} dialog Shared Dialog Boxes.
   * @param {TranslateService} translateService Translate Service.
   */
  constructor(
    private route: ActivatedRoute,
    private rolesService: RolesService,
    private router: Router,
    private formBuilder: UntypedFormBuilder,
    private translateService: TranslateService,
    public dialog: MatDialog,
    private authService: AuthService
  ) {
    this.route.data.subscribe((data: { roledetails: any }) => {
      this.rolePermissionService = data.roledetails;
      // Only create form and group rules after data is available
      this.createForm();
      this.groupRules();
      this.selectedItem = 'special';
      this.showPermissions('special');
    });
  }

  /**
   * Groups all the data on init
   */
  ngOnInit() {
    this.permissions = {
      permissions: []
    };
    this.route.params.subscribe((routeParams: any) => {
      this.roleId = routeParams.id;
    });
    // Form creation moved to constructor after data is loaded
  }

  /**
   * creates the form to display and edit permissions
   */
  createForm() {
    const permissionData =
      this.rolePermissionService && Array.isArray(this.rolePermissionService.permissionUsageData)
        ? this.rolePermissionService.permissionUsageData
        : [];
    this.formGroup = this.formBuilder.group({
      roster: this.formBuilder.array(permissionData.map((elem: any) => this.createMemberGroup(elem)))
    });
  }

  createMemberGroup(permission: any): UntypedFormGroup {
    return this.formBuilder.group({
      ...permission,
      ...{
        code: [
          permission.code,
          Validators.required
        ],
        selected: [
          { value: permission.selected, disabled: true },
          Validators.required
        ]
      }
    });
  }

  /**
   * Groups the permissions based on rules
   */
  groupRules() {
    this.tempPermissionUIData = {};
    for (const i in this.rolePermissionService.permissionUsageData) {
      if (this.rolePermissionService.permissionUsageData[i]) {
        if (this.rolePermissionService.permissionUsageData[i].grouping !== this.currentGrouping) {
          this.currentGrouping = this.rolePermissionService.permissionUsageData[i].grouping;
          this.groupings.push(this.currentGrouping);
          this.tempPermissionUIData[this.currentGrouping] = { permissions: [] };
        }
        const temp = {
          code: this.rolePermissionService.permissionUsageData[i].code,
          id: +i,
          selected: this.rolePermissionService.permissionUsageData[i].selected
        };
        this.tempPermissionUIData[this.currentGrouping].permissions.push(temp);
      }
    }
  }

  /**
   * Displays the permission for selected role
   * @param grouping Selected Role
   */
  showPermissions(grouping: string) {
    this.permissions = this.tempPermissionUIData[grouping];
    this.selectedItem = grouping;
    this.previousGrouping = grouping;
  }

  /**
   * Formats the Role Name
   * @param string String
   */
  formatName(string: any) {
    if (string.indexOf('portfolio_') > -1) {
      string = string.replace('portfolio_', '');
    }
    if (string.indexOf('transaction_') > -1) {
      const temp = string.split('_');
      string = temp[1] + ' ' + temp[0].charAt(0).toUpperCase() + temp[0].slice(1) + 's';
    }
    string = string.charAt(0).toUpperCase() + string.slice(1);
    return string;
  }

  /**
   * Formats the permission from permission code
   * @param name String
   */
  permissionName(name: any) {
    name = name || '';
    // replace '_' with ' '
    name = name.replace(/_/g, ' ');
    // for reports replace read with view
    if (this.previousGrouping === 'report') {
      name = name.replace(/READ/g, 'View');
    }
    return name;
  }

  /**
   * Backups the values
   */
  backupCheckValues() {
    this.backupform = _.cloneDeep(this.formGroup) as UntypedFormGroup;
  }

  /**
   * Restores the checkboxes to previous data on clicking cancel
   */
  restoreCheckboxes() {
    if (this.backupform) {
      this.formGroup = _.cloneDeep(this.backupform) as UntypedFormGroup;
    }
  }

  isRoleEnable(value: any) {
    return value;
  }

  editRoles() {
    this.isDisabled = false;
    if (this.formGroup && this.formGroup.controls && this.formGroup.controls.roster) {
      this.formGroup.controls.roster.enable();
      const rosterArray = this.formGroup.get('roster') as FormArray;
      if (rosterArray && Array.isArray(rosterArray.controls)) {
        rosterArray.controls.forEach((group: UntypedFormGroup) => {
          if (group && group.controls && group.controls.selected) {
            group.controls.selected.enable();
          }
        });
      }
    }
  }

  /**
   * Cancel the changes
   */
  cancel() {
    this.isDisabled = true;
    if (this.formGroup && this.formGroup.controls && this.formGroup.controls.roster) {
      this.formGroup.controls.roster.disable();
    }
  }

  /**
   * Submits the modified permissions
   */
  submit() {
    const value = this.formGroup.get('roster').value;
    const data: { [key: string]: boolean } = {};
    const permissionData = {
      permissions: {}
    };
    for (let i = 0; i < value.length; i++) {
      data[value[i].code] = value[i].selected;
    }
    permissionData.permissions = data;
    this.formGroup.controls.roster.disable();
    this.checkboxesChanged = false;
    this.isDisabled = true;
    this.rolesService
      .updateRolePermissions({
        roleId: this.roleId,
        putRolesRoleIdPermissionsRequest: permissionData
      })
      .subscribe((response: any) => {});
  }

  /**
   * Selects all the permission of a particular role
   */
  selectAll() {
    const roster = this.formGroup.get('roster') as FormArray;
    for (let i = 0; i < this.permissions.permissions.length; i++) {
      roster.at(this.permissions.permissions[i].id).patchValue({
        selected: true
      });
    }
  }

  /**
   * Deselects all the permissions of a particular role
   */
  deselectAll() {
    const roster = this.formGroup.get('roster') as FormArray;
    for (let i = 0; i < this.permissions.permissions.length; i++) {
      roster.at(this.permissions.permissions[i].id).patchValue({
        selected: false
      });
    }
  }

  /**
   * Deletes the Role and redirects to Roles and Permissions.
   */
  deleteRole() {
    this.roleId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.params['id'] || this.roleId;
    if (this.roleId === null || this.roleId === undefined || this.roleId === '') {
      console.error('Delete Role Error: roleId is null or undefined');
      alert('Cannot delete role: roleId is missing.');
      return;
    }
    const roleIdNum = Number(this.roleId);
    if (isNaN(roleIdNum)) {
      console.error('Delete Role Error: roleId is not a valid number');
      alert('Cannot delete role: roleId is not a valid number.');
      return;
    }
    console.log('Delete Role: roleId =', roleIdNum);
    const deleteRoleDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.inputs.Role') + ' ' + roleIdNum }
    });
    deleteRoleDialogRef.afterClosed().subscribe((response: any) => {
      if (response && response.delete) {
        this.rolesService.deleteRole({ roleId: roleIdNum }).subscribe(() => {
          if (environment.OIDC.oidcServerEnabled) {
            this.authService.deleteRole(String(roleIdNum));
          }
          this.router.navigate(['/system/roles-and-permissions']);
        });
      }
    });
  }

  /**
   * Enables the Role and redirects to Roles and Permissions.
   */
  enableRolesConfirmation() {
    this.roleId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.params['id'] || this.roleId;
    if (this.roleId === null || this.roleId === undefined || this.roleId === '') {
      console.error('Enable Role Error: roleId is null or undefined');
      alert('Cannot enable role: roleId is missing.');
      return;
    }
    const roleIdNum = Number(this.roleId);
    if (isNaN(roleIdNum)) {
      console.error('Enable Role Error: roleId is not a valid number');
      alert('Cannot enable role: roleId is not a valid number.');
      return;
    }
    const enableRoleDialogRef = this.dialog.open(EnableDialogComponent, {
      data: { enableContext: this.translateService.instant('labels.inputs.Role') + ' ' + roleIdNum }
    });
    enableRoleDialogRef.afterClosed().subscribe((response: any) => {
      if (response && response.enable) {
        this.rolesService.actionsOnRoles({ roleId: roleIdNum }).subscribe(() => {
          this.router.navigate(['/system/roles-and-permissions']);
        });
      }
    });
  }

  /**
   * Disables the Role and redirects to Roles and Permissions.
   */
  disableRolesConfirmation() {
    this.roleId = this.route.snapshot.paramMap.get('id') || this.route.snapshot.params['id'] || this.roleId;
    if (this.roleId === null || this.roleId === undefined || this.roleId === '') {
      console.error('Disable Role Error: roleId is null or undefined');
      alert('Cannot disable role: roleId is missing.');
      return;
    }
    const roleIdNum = Number(this.roleId);
    if (isNaN(roleIdNum)) {
      console.error('Disable Role Error: roleId is not a valid number');
      alert('Cannot disable role: roleId is not a valid number.');
      return;
    }
    console.log('Disable Role: roleId =', roleIdNum);
    const deleteRoleDialogRef = this.dialog.open(DisableDialogComponent, {
      data: { disableContext: this.translateService.instant('labels.inputs.Role') + ' ' + roleIdNum }
    });
    deleteRoleDialogRef.afterClosed().subscribe((response: any) => {
      if (response && response.disable) {
        this.rolesService.actionsOnRoles({ roleId: roleIdNum }).subscribe(() => {
          this.router.navigate(['/system/roles-and-permissions']);
        });
      }
    });
  }
}
