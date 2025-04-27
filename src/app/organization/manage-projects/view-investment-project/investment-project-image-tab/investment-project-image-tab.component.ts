import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UploadDocumentDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { UploadImageDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-image-dialog/upload-image-dialog.component';
import { OrganizationService } from 'app/organization/organization.service';
import { SystemService } from 'app/system/system.service';

@Component({
  selector: 'mifosx-investment-project-image-tab',
  templateUrl: './investment-project-image-tab.component.html',
  styleUrls: ['./investment-project-image-tab.component.scss']
})
export class InvestmentProjectImageTabComponent {
  imageData: any;
  projectId: any;

  constructor(
    private route: ActivatedRoute,
    private dialog: MatDialog,
    private organizationService: OrganizationService,
    private systemService: SystemService
  ) {
    this.projectId = this.route.parent.snapshot.params['id'];

    this.route.data.subscribe((data: { imageData: any }) => {
      this.imageData = data.imageData;
      console.log(this.imageData);
    });
  }

  uploadDocument() {
    const uploadDocumentDialogRef = this.dialog.open(UploadImageDialogComponent, {
      data: { documentIdentifier: false, entityType: '' }
    });
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      if (dialogResponse) {
        const formData: FormData = new FormData();
        formData.append('name', dialogResponse.name);
        formData.append('fileName', dialogResponse.name);
        formData.append('file', dialogResponse);
        this.organizationService.uploadProjectDocumentsImage(this.projectId, formData).subscribe((response: any) => {
          this.getProjectImages();
        });
      }
    });
  }

  getProjectImages(): void {
    this.systemService.getObjectDocuments('projects', this.projectId).subscribe((response: any) => {
      this.imageData = response;
    });
  }

  getImagePath(location: string): string {
    return 'https://bucketfinedev.s3.amazonaws.com/' + location;
  }
}
