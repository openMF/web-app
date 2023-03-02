import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { UploadDocumentDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { SavingsService } from 'app/savings/savings.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';

@Component({
  selector: 'mifosx-savings-documents-tab',
  templateUrl: './savings-documents-tab.component.html',
  styleUrls: ['./savings-documents-tab.component.scss']
})
export class SavingsDocumentsTabComponent implements OnInit {

  /** Stores the resolved savings documents data */
  entityDocuments: any;
  /** Stores the saving Account Id */
  entityId: string;
  entityType = 'savings';

  /**
   * Retrieves the savings data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute,
    private savingsService: SavingsService,
    private settingsService: SettingsService,
    public dialog: MatDialog) {
    this.route.data.subscribe((data: { savingsDocuments: any }) => {
      this.setSavingsDocumentsData(data.savingsDocuments);
    });
    this.entityId = this.route.snapshot.params['savingAccountId'];
  }

  ngOnInit() {
  }

  setSavingsDocumentsData(data: any) {
    data.forEach((ele: any) => {
      ele.docUrl = this.settingsService.serverUrl + '/savings/' + ele.parentEntityId + '/documents/' + ele.id + '/attachment?tenantIdentifier=' + environment.fineractPlatformTenantId;
      if (ele.fileName) {
        if (ele.fileName.toLowerCase().indexOf('.jpg') !== -1 || ele.fileName.toLowerCase().indexOf('.jpeg') !== -1 || ele.fileName.toLowerCase().indexOf('.png') !== -1) {
          ele.fileIsImage = true;
        }
      }
      if (ele.type) {
        if (ele.type.toLowerCase().indexOf('image') !== -1) {
          ele.fileIsImage = true;
        }
      }
    });
    this.entityDocuments = data;
  }

  downloadDocument(parentEntityId: string, documentId: string) {
    this.savingsService.downloadSavingsDocument(parentEntityId, documentId).subscribe(res => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  uploadDocument(formData: FormData): any {
    return this.savingsService.loadSavingsDocument(this.entityId, formData);
  }

  deleteDocument(documentId: any) {
    this.savingsService.deleteSavingsDocument(this.entityId, documentId).subscribe((res: any) => {});
  }

}
