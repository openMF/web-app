/** Angular Imports */
import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FormGroup, FormBuilder, UntypedFormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

/** Custom Dialogs */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { GroupsService } from 'app/customApis.service';
import { ClientService } from '@fineract/client';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteTrigger, MatAutocomplete, MatOption } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatListSubheaderCssMatStyler, MatNavList } from '@angular/material/list';
import { MatLine } from '@angular/material/grid-list';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { privateDecrypt } from 'crypto';

/**
 * Manage Group Members Component
 */
@Component({
  selector: 'mifosx-manage-group-members',
  templateUrl: './manage-group-members.component.html',
  styleUrls: ['./manage-group-members.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatAutocompleteTrigger,
    MatAutocomplete,
    MatIconButton,
    FaIconComponent,
    MatListSubheaderCssMatStyler,
    MatNavList,
    MatLine,
    MatTooltip
  ]
})
export class ManageGroupMembersComponent implements AfterViewInit {
  /** Group Data */
  groupData: any;
  /** Client data. */
  clientsData: any = [];
  /** Client Members. */
  clientMembers: any[] = [];
  /** Client Choice. */
  clientChoice = new UntypedFormControl('');

  /**
   * Fetches group action data from `resolve`
   * @param {ActivatedRoute} route Activated Route
   * @param {GroupsService} groupsService Groups Service
   * @param {ClientsService} clientsService Clients Service
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(
    private route: ActivatedRoute,
    private clientsService: ClientService,
    public dialog: MatDialog,
    private customGroupsService: GroupsService
  ) {
    this.route.data.subscribe((data: { groupActionData: any }) => {
      this.groupData = data.groupActionData;
      this.clientMembers = data.groupActionData.clientMembers || [];
    });
  }

  /**
   * Subscribes to Clients search filter:
   */
  ngAfterViewInit() {
    this.clientChoice.valueChanges.subscribe((value: string) => {
      if (value.length >= 2) {
        this.clientsService
          .retrieveAll21({
            displayName: value,
            orphansOnly: true,
            orderBy: 'displayName',
            sortOrder: 'ASC',
            officeId: this.groupData.officeId
          })
          .subscribe((data: any) => {
            this.clientsData = data.pageItems;
          });
      }
    });
  }

  /**
   * Get the group ID from various possible sources
   */
  private getGroupId(): number | null {
    const id = this.groupData?.id || this.route.snapshot.paramMap.get('groupId');
    return id ? Number(id) : null;
  }

  /**
   * Add client.
   */
  addClient() {
    // Check if a client is selected and not already in the members list
    const selectedClient = this.clientChoice.value;

    if (selectedClient) {
      // Handle both cases: when selectedClient is an object or just an ID
      const clientId = typeof selectedClient === 'object' ? selectedClient.id : selectedClient;
      const groupId = this.getGroupId();

      console.log('Debug - selectedClient:', selectedClient);
      console.log('Debug - clientId:', clientId);
      console.log('Debug - groupData:', this.groupData);
      console.log('Debug - groupId:', groupId);

      if (clientId && groupId) {
        // Use the custom service to associate client
        this.customGroupsService
          .executeGroupCommand(groupId.toString(), 'associateClients', { clientMembers: [clientId] })
          .subscribe(
            () => {
              // If the selectedClient is just an ID, we need to find the client object
              const clientToAdd =
                typeof selectedClient === 'object'
                  ? selectedClient
                  : this.clientsData.find((c: any) => c.id === clientId);

              if (clientToAdd && !this.clientMembers.some((member) => member.id === clientToAdd.id)) {
                this.clientMembers.push(clientToAdd);
              }
              this.clientChoice.setValue('');
            },
            (error) => {
              console.error('Error associating client:', error);
            }
          );
      } else {
        console.error('Missing client ID or group ID - clientId:', clientId, 'groupId:', groupId);
      }
    }
  }

  /**
   * Remove client.
   * @param {number} index Client's array index.
   * @param {any} client Client
   */
  removeClient(index: number, client: any) {
    // Safety check - ensure we have a client object with a displayName
    const clientName = client?.displayName || 'selected client';

    const removeMemberDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `client member: ${clientName}` }
    });
    removeMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        const groupId = this.getGroupId();
        // Handle both cases: when client is an object or just an ID
        const clientId = typeof client === 'object' ? client.id : client;

        if (clientId && groupId) {
          this.customGroupsService
            .executeGroupCommand(groupId.toString(), 'disassociateClients', { clientMembers: [clientId] })
            .subscribe(
              () => {
                this.clientMembers.splice(index, 1);
              },
              (error) => {
                console.error('Error disassociating client:', error);
              }
            );
        } else {
          console.error('Missing client ID or group ID for remove - clientId:', clientId, 'groupId:', groupId);
        }
      }
    });
  }

  /**
   * Displays Client name in form control input.
   * @param {any} client Client data.
   * @returns {string} Client name if valid otherwise undefined.
   */
  displayClient(client: any): string | undefined {
    if (!client) {
      return undefined;
    }

    // Simply return the displayName if it exists
    return client.displayName;
  }
}
