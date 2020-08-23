/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';

/** Custom Dialogs */
import { UnassignRoleDialogComponent } from '../custom-dialogs/unassign-role-dialog/unassign-role-dialog.component';

/** Custom Services */
import { GroupsService } from 'app/groups/groups.service';

/**
 * Groups Committee Tab Component
 */
@Component({
  selector: 'mifosx-committee-tab',
  templateUrl: './committee-tab.component.html',
  styleUrls: ['./committee-tab.component.scss']
})
export class CommitteeTabComponent {

  /** Group Status */
  groupStatus: any;
  /** Group Roles Data */
  groupRolesData: any[];
  /** Groups View Data */
  groupViewData: any;
  /** Columns to be Displayed for client members table */
  groupRolesColumns: string[] = ['Name', 'Role', 'Client Id', 'Actions'];

  /** Roles Table */
  @ViewChild('rolesTable') rolesTableRef: MatTable<Element>;

  /**
   * Fetches groups data from parent's `resolve`.
   * @param {ActivatedRoute} route Activated Route
   * @param {GroupsService} groupsService Groups Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(private route: ActivatedRoute,
              private groupsService: GroupsService,
              public dialog: MatDialog) {
    this.route.parent.data.subscribe((data: { groupViewData: any }) => {
      this.groupViewData = data.groupViewData;
      this.groupRolesData = this.groupViewData.groupRoles;
      this.groupStatus = this.groupViewData.status.value;
    });
  }
  /**
   * Unassigns a client's role.
   * @param {any} clientId Client Id
   * @param {any} roleId Role Id
   */
  unassignRole(clientId: any, roleId: any) {
    const unAssignRoleDialogRef = this.dialog.open(UnassignRoleDialogComponent, {
      data: { id: clientId }
    });
    unAssignRoleDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        const clientIndex = this.groupRolesData.findIndex((client: any) => client.clientId === clientId);
        this.groupRolesData.splice(clientIndex, 1);
        this.rolesTableRef.renderRows();
        this.groupsService.unAssignRoleCommand(this.groupViewData.id, roleId).subscribe(() => {});
      }
    });
  }

}
