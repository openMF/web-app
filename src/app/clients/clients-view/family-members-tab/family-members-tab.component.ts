import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { ClientsService } from '../../clients.service';

@Component({
  selector: 'mifosx-family-members-tab',
  templateUrl: './family-members-tab.component.html',
  styleUrls: ['./family-members-tab.component.scss']
})
export class FamilyMembersTabComponent implements OnInit {
  clientFamilyMembers: any;
  constructor(private route: ActivatedRoute,
    private router: Router,
    private clientsService: ClientsService,
    public dialog: MatDialog) {
    this.route.data.subscribe((data: { clientFamilyMembers: any }) => {
      this.clientFamilyMembers = data.clientFamilyMembers;
    });
  }

  ngOnInit() {
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
        this.clientsService.deleteFamilyMember(clientId, id)
          .subscribe(() => {
            this.clientFamilyMembers.splice(index, 1);
          });
      }
    });
  }

}
