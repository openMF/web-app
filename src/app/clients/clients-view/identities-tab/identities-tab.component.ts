import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material';

/** Custom Components */
import { UploadDocumentDialogComponent } from '../upload-document-dialog/upload-document-dialog.component';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { ClientsService } from '../../clients.service';

@Component({
  selector: 'mifosx-identities-tab',
  templateUrl: './identities-tab.component.html',
  styleUrls: ['./identities-tab.component.scss']
})
export class IdentitiesTabComponent implements OnInit {
  @ViewChild('identifiersTable') identifiersTable: MatTable<Element>;
  identitiesColumns: string[] = ['id', 'description', 'type', 'documents', 'status', 'actions'];
  clientIdentities: any;

  constructor(private route: ActivatedRoute,
    public dialog: MatDialog,
    private clientService: ClientsService) {
    this.route.data.subscribe((data: { clientIdentities: any }) => {
      this.clientIdentities = data.clientIdentities;
    });
  }

  ngOnInit() {
  }

  download(parentEntityId: string, documentId: string) {
    this.clientService.downloadClientIdentificationDocument(parentEntityId, documentId).subscribe(res => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  deleteIdentifier(clientId: string, identifierId: string, index: number) {
    const deleteFamilyMemberDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `identifier id:${identifierId}` }
    });
    deleteFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientService.deleteClientIdentifier(clientId, identifierId).subscribe(res => {
          this.clientIdentities.splice(index, 1);
          this.identifiersTable.renderRows();
        });
      }
    });
  }

  uploadDocument(index: number, identifierId: string) {
    const uploadDocumentDialogRef = this.dialog.open(UploadDocumentDialogComponent);
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      if (dialogResponse) {
        const formData: FormData = new FormData;
        formData.append('name', dialogResponse.fileName);
        formData.append('file', dialogResponse.file);
        this.clientService.uploadClientIdentifierDocument(identifierId, formData).subscribe((res: any) => {
          this.clientIdentities[index].documents.push({
            id: res.resourceId,
            parentEntityType: 'client_identifiers',
            parentEntityId: identifierId,
            name: dialogResponse.fileName,
            fileName: dialogResponse.file.fileName
          });
          this.identifiersTable.renderRows();
        });
      }
    });
  }
}
