/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MatDialog } from '@angular/material/dialog';

/** Custom Dialogs */
import { UnassignStaffDialogComponent } from './custom-dialogs/unassign-staff-dialog/unassign-staff-dialog.component';
import { UploadSignatureDialogComponent } from './custom-dialogs/upload-signature-dialog/upload-signature-dialog.component';
import { ViewSignatureDialogComponent } from './custom-dialogs/view-signature-dialog/view-signature-dialog.component';
import { DeleteSignatureDialogComponent } from './custom-dialogs/delete-signature-dialog/delete-signature-dialog.component';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { UploadImageDialogComponent } from './custom-dialogs/upload-image-dialog/upload-image-dialog.component';
import { CaptureImageDialogComponent } from './custom-dialogs/capture-image-dialog/capture-image-dialog.component';

/** Custom Services */
import { ClientsService } from '../clients.service';
import { MatomoTracker } from "@ngx-matomo/tracker";

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

 /**
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router service
   * @param {ClientsService} clientService Clients Service
   * @param {DomSanitizer} _sanitizer Dom sanitizer service
   * @param {MatDialog} dialog Mat Dialog
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */  constructor(private route: ActivatedRoute,
    private router: Router,
    private clientsService: ClientsService,
    private _sanitizer: DomSanitizer,
    public dialog: MatDialog,
    private matomoTracker: MatomoTracker
  ) {
    this.route.data.subscribe((data: {
      clientViewData: any,
      clientTemplateData: any,
      clientDatatables: any
    }) => {
      this.clientViewData = data.clientViewData;
      this.clientDatatables = data.clientDatatables;
      // this.clientTemplateData = data.clientTemplateData;
    });
  }

  ngOnInit() {
    //set page view info
    let title = document.title || "";
    this.matomoTracker.setDocumentTitle(`${title}`);

    this.clientsService.getClientProfileImage(this.clientViewData.id).subscribe(
      (base64Image: any) => {
        this.clientImage = this._sanitizer.bypassSecurityTrustResourceUrl(base64Image);
      }, (error: any) => { }
    );
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
      case 'Withdraw':
      case 'Update Default Savings':
      case 'Transfer Client':
      case 'Undo Transfer':
      case 'Accept Transfer':
      case 'Reject Transfer':
      case 'Reactivate':
      case 'Undo Rejection':
      case 'Add Charge':
      case 'Create Self Service User':
      case 'Client Screen Reports':
        this.router.navigate([`actions/${name}`], { relativeTo: this.route });
        break;
      case 'Unassign Staff':
        this.unassignStaff();
        break;
      case 'Delete':
        this.deleteClient();
        break;
      case 'View Signature':
        this.viewSignature();
        break;
      case 'Upload Signature':
        this.uploadSignature();
        break;
      case 'Delete Signature':
        this.deleteSignature();
        break;
      case 'Capture Image':
        this.captureProfileImage();
        break;
      case 'Upload Image':
        this.uploadProfileImage();
        break;
      case 'Delete Image':
        this.deleteProfileImage();
        break;
      case 'Create Standing Instructions':
        const createStandingInstructionsQueryParams: any = { officeId: this.clientViewData.officeId, accountType: 'fromsavings' };
        this.router.navigate(['standing-instructions/create-standing-instructions'], { relativeTo: this.route, queryParams: createStandingInstructionsQueryParams });
        break;
      case 'View Standing Instructions':
        const viewStandingInstructionsQueryParams: any = { officeId: this.clientViewData.officeId, accountType: 'fromsavings' };
        this.router.navigate(['standing-instructions/list-standing-instructions'], { relativeTo: this.route, queryParams: viewStandingInstructionsQueryParams });
        break;
    }
  }


  /**
   * Refetches data for the component
   * TODO: Replace by a custom reload component instead of hard-coded back-routing.
   */
  reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }

  /**
   * Deletes the client
   */
  private deleteClient() {

    //Track Matomo event in clients module
    this.matomoTracker.trackEvent('clients', 'delete', this.clientViewData.id);

    const deleteClientDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `client with id: ${this.clientViewData.id}` }
    });
    deleteClientDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteClient(this.clientViewData.id).subscribe(() => {
          this.router.navigate(['/clients'], { relativeTo: this.route });
        });
        //Track Matomo event in clients module
        this.matomoTracker.trackEvent('clients', 'deleteSuccess', this.clientViewData.id);
      }
    });
  }

  /**
   * Unassign's the client's staff.
   */
  private unassignStaff() {

    //Track Matomo event in clients module
    this.matomoTracker.trackEvent('clients', 'unassignStaff', this.clientViewData.staffId);

    const unAssignStaffDialogRef = this.dialog.open(UnassignStaffDialogComponent);
    unAssignStaffDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        this.clientsService.executeClientCommand(this.clientViewData.id, 'unassignStaff', { staffId: this.clientViewData.staffId })
          .subscribe(() => {
            this.reload();
          });

        //Track Matomo event in clients module
        this.matomoTracker.trackEvent('clients', 'unassignStaffSuccess', this.clientViewData.staffId);
      }
    });
  }

  /**
   * Shows client signature in a dialog
   */
  private viewSignature() {
    //Track Matomo event in clients module
    this.matomoTracker.trackEvent('clients', 'viewSignature', this.clientViewData.id);

    this.clientsService.getClientDocuments(this.clientViewData.id).subscribe((documents: any) => {
      const viewSignatureDialogRef = this.dialog.open(ViewSignatureDialogComponent, {
        data: {
          documents: documents,
          id: this.clientViewData.id
        }
      });
      viewSignatureDialogRef.afterClosed().subscribe((response: any) => {
        if (response.upload) {
          this.uploadSignature();
        } else if (response.delete) {
          this.deleteSignature();
        }
      });
    });
  }

  /**
   * Uploads client signature
   */
  private uploadSignature() {
    //Track Matomo event in clients module
    this.matomoTracker.trackEvent('clients', 'uploadSignature', this.clientViewData.id);

    const uploadSignatureDialogRef = this.dialog.open(UploadSignatureDialogComponent);
    uploadSignatureDialogRef.afterClosed().subscribe((signature: File) => {
      if (signature) {
        this.clientsService.uploadClientSignatureImage(this.clientViewData.id, signature)
          .subscribe(() => {
            this.reload();
          });
        //Track Matomo event in clients module
        this.matomoTracker.trackEvent('clients', 'uploadSignatureSuccess', this.clientViewData.id);
      }
    });
  }

  /**
   * Deletes client signature
   */
  private deleteSignature() {
    //Track Matomo event in clients module
    this.matomoTracker.trackEvent('clients', 'deleteSignature', this.clientViewData.id);

    this.clientsService.getClientDocuments(this.clientViewData.id).subscribe((documents: any) => {
      const deleteSignatureDialogRef = this.dialog.open(DeleteSignatureDialogComponent, {
        data: documents
      });
      deleteSignatureDialogRef.afterClosed().subscribe((response: any) => {
        if (response.delete) {
          this.clientsService.deleteClientDocument(this.clientViewData.id, response.id)
            .subscribe(() => {
              this.reload();
            });
        } else if (response.upload) {
          this.uploadSignature();
        }

        if (response) { //maybe some' better
          //Track Matomo event in clients module
          this.matomoTracker.trackEvent('clients', 'deleteSignatureSuccess', this.clientViewData.id);
        }
      });
    });
  }

  /**
   * Captures clients profile image.
   */
  private captureProfileImage() {
    //Track Matomo event in clients module
    this.matomoTracker.trackEvent('clients', 'captureProfileImage', this.clientViewData.id);

    const captureImageDialogRef = this.dialog.open(CaptureImageDialogComponent);
    captureImageDialogRef.afterClosed().subscribe((imageURL: string) => {
      if (imageURL) {
        this.clientsService.uploadCapturedClientProfileImage(this.clientViewData.id, imageURL)
          .subscribe(() => {
            this.reload();
          });
        //Track Matomo event in clients module
        this.matomoTracker.trackEvent('clients', 'captureProfileImageSuccess', this.clientViewData.id);
      }
    });
  }

  /**
   * Uploads the clients image.
   */
  private uploadProfileImage() {
    //Track Matomo event in clients module
    this.matomoTracker.trackEvent('clients', 'uploadProfileImage', this.clientViewData.id);

    const uploadImageDialogRef = this.dialog.open(UploadImageDialogComponent);
    uploadImageDialogRef.afterClosed().subscribe((image: File) => {
      if (image) {
        this.clientsService.uploadClientProfileImage(this.clientViewData.id, image)
          .subscribe(() => {
            this.reload();
          });
        //Track Matomo event in clients module
        this.matomoTracker.trackEvent('clients', 'uploadProfileImageSuccess', this.clientViewData.id);
      }
    });
  }

  /**
   * Deletes the client image.
   */
  private deleteProfileImage() {
    //Track Matomo event in clients module
    this.matomoTracker.trackEvent('clients', 'deleteProfileImage', this.clientViewData.id);

    const deleteClientImageDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `the profile image of ${this.clientViewData.displayName}` }
    });
    deleteClientImageDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteClientProfileImage(this.clientViewData.id)
          .subscribe(() => {
            this.reload();
          });
        //Track Matomo event in clients module
        this.matomoTracker.trackEvent('clients', 'deleteProfileImageSuccess', this.clientViewData.id);
      }
    });
  }

}
