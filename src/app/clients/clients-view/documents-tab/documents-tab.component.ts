import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { ClientsService } from '../../clients.service';

/** Custom Components */
import { UploadDocumentDialogComponent } from '../custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';


@Component({
  selector: 'mifosx-documents-tab',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss']
})
export class DocumentsTabComponent implements OnInit {
  @ViewChild('documentsTable', { static: true }) documentsTable: MatTable<Element>;
  documentsColumns: string[] = ['name', 'description', 'fileName', 'actions'];
  clientDocuments: any;
  clientId: string;


  constructor(private route: ActivatedRoute,
    private clientService: ClientsService,
    public dialog: MatDialog) {
    this.route.data.subscribe((data: { clientDocuments: any }) => {
      this.clientDocuments = data.clientDocuments;
      console.log(this.clientDocuments);

    });
    this.clientId = this.route.parent.snapshot.paramMap.get('clientId');
  }

  ngOnInit() {
  }

  download(parentEntityId: string, documentId: string) {
    this.clientService.downloadClientDocument(parentEntityId, documentId).subscribe(res => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  deleteDocument(parentEntityId: string, documentId: string, index: number) {
    const deleteDocumentDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `document id:${documentId}` }
    });
    deleteDocumentDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientService.deleteClientDocument(parentEntityId, documentId).subscribe(res => {
          this.clientDocuments.splice(index, 1);
          this.documentsTable.renderRows();
        });
      }
    });
  }

  uploadDocument() {
    const uploadDocumentDialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: { documentIdentifier: false }
    });
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      console.log(dialogResponse);
      if (dialogResponse) {
        const formData: FormData = new FormData;
        formData.append('name', dialogResponse.fileName);
        formData.append('file', dialogResponse.file);
        formData.append('description', dialogResponse.description);
        this.clientService.uploadClientDocument(this.clientId, formData).subscribe((res: any) => {
          this.clientDocuments.push({
            id: res.resourceId,
            parentEntityType: 'clients',
            parentEntityId: this.clientId,
            name: dialogResponse.fileName,
            description: dialogResponse.description,
            fileName: dialogResponse.file.name
          });
          this.documentsTable.renderRows();
          console.log('document Uploaded');
        });
      }
    });
  }

}
