/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';

/** Custom Dialogs */
import { UnassignStaffDialogComponent } from './custom-dialogs/unassign-staff-dialog/unassign-staff-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { ClientsService } from '../clients.service';

@Component({
  selector: 'mifosx-clients-view',
  templateUrl: './clients-view.component.html',
  styleUrls: ['./clients-view.component.scss']
})
export class ClientsViewComponent implements OnInit {

  clientViewData: any;
  clientDatatables: any;
  clientImage: any;
  clientTemplateData: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private clientsService: ClientsService,
              private _sanitizer: DomSanitizer,
              public dialog: MatDialog) {
    this.route.data.subscribe((data: {
      clientViewData: any,
      clientTemplateData: any,
      clientDatatables: any
    }) => {
      this.clientViewData = data.clientViewData;
      this.clientDatatables = data.clientDatatables;
      this.clientTemplateData = data.clientTemplateData;
    });
  }

  ngOnInit() {
    this.clientsService.getClientProfileImage(this.clientViewData.id).subscribe((base64Image: any) => {
      this.clientImage = this._sanitizer.bypassSecurityTrustResourceUrl(base64Image);
    });
  }

  /**
   * Performs action button/option action.
   * @param {string} name action name.
   */
  doAction(name: string) {
    switch (name) {
      case 'Assign Staff':
      case 'Close':
      case 'Survey':
      case 'Reject':
      case 'Activate':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
       case 'Unassign Staff':
        this.unassignStaff();
        break;
      case 'Delete':
        this.deleteClient();
    }
  }


  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients`, {skipLocationChange: true})
      .then(() => this.router.navigate([url]));
  }

  /**
   * Deletes the client
   */
  private deleteClient() {
    const deleteClientDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `client with id: ${this.clientViewData.id}` }
    });
    deleteClientDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteClient(this.clientViewData.id).subscribe(() => {
          this.router.navigate(['/clients'], { relativeTo: this.route });
        });
      }
    });
  }

  /**
   * Unassign's the client's staff.
   */
  private unassignStaff() {
    const unAssignStaffDialogRef = this.dialog.open(UnassignStaffDialogComponent);
    unAssignStaffDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.clientsService.executeClientCommand(this.clientViewData.id, 'unassignStaff', { staffId: this.clientViewData.staffId })
          .subscribe(() => {
            this.reload();
          });
      }
    });
  }

}
