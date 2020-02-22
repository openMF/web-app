/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material';

/** Custom Dialogs */
import { UnassignStaffDialogComponent } from './custom-dialogs/unassign-staff-dialog/unassign-staff-dialog.component';

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
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
       case 'Unassign Staff':
        this.unassignStaff();
        break;
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
   * Unassign's the group's staff.
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
