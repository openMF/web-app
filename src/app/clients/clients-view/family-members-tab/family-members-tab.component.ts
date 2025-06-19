/** Angular Imports */
import { Component } from '@angular/core';
import { ActivatedRoute, RouterOutlet, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { ClientsService } from '../../clients.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import {
  MatAccordion,
  MatExpansionPanel,
  MatExpansionPanelHeader,
  MatExpansionPanelTitle,
  MatExpansionPanelDescription
} from '@angular/material/expansion';
import { MatDivider } from '@angular/material/divider';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';
import { YesnoPipe } from '../../../pipes/yesno.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Client Family Members Tab
 */
@Component({
  selector: 'mifosx-family-members-tab',
  templateUrl: './family-members-tab.component.html',
  styleUrls: ['./family-members-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    RouterOutlet,
    FaIconComponent,
    MatAccordion,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    MatExpansionPanelDescription,
    MatDivider,
    DateFormatPipe,
    YesnoPipe
  ]
})
export class FamilyMembersTabComponent {
  /** Client Family Members */
  clientFamilyMembers: any;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {ClientsService} clientsService Clients Service
   * @param {MatDialog }dialog Mat Dialog
   */
  constructor(
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { clientFamilyMembers: any }) => {
      this.clientFamilyMembers = data.clientFamilyMembers;
    });
  }

  /**
   * Deletes the family member and redirects to family members tab.
   */
  deleteFamilyMember(clientId: string, id: string, name: string, index: number) {
    const deleteFamilyMemberDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Family member id:${id} name : ${name} ${index}` }
    });
    deleteFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteFamilyMember(clientId, id).subscribe(() => {
          this.clientFamilyMembers.splice(index, 1);
        });
      }
    });
  }

  displayName(member: any): string {
    let fullName: string = member.firstName;
    if (member.middleName) {
      fullName = fullName + ' ' + member.middleName;
    }
    if (member.lastName) {
      fullName = fullName + ' ' + member.lastName;
    }
    return fullName;
  }
}
