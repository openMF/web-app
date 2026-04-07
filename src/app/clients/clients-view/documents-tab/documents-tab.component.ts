import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { DocumentsService } from '@fineract/client';
import { EntityDocumentsTabComponent } from '../../../shared/tabs/entity-documents-tab/entity-documents-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-documents-tab',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityDocumentsTabComponent
  ]
})
export class DocumentsTabComponent {
  entityDocuments: any;
  entityId: string;
  entityType = 'clients';

  constructor(
    private route: ActivatedRoute,
    private documentsService: DocumentsService,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { clientDocuments: any }) => {
      this.entityDocuments = data.clientDocuments;
    });
    this.entityId = this.route.parent.snapshot.paramMap.get('clientId');
  }

  downloadDocument(documentId: string) {
    this.documentsService
      .downloadFile({
        entityType: this.entityType,
        entityId: Number(this.entityId),
        documentId: Number(documentId)
      })
      .subscribe((res: any) => {
        const url = window.URL.createObjectURL(res);
        window.open(url);
      });
  }

  deleteDocument(documentId: string) {
    this.documentsService
      .deleteDocument({
        entityType: this.entityType,
        entityId: Number(this.entityId),
        documentId: Number(documentId)
      })
      .subscribe(() => {});
  }

  uploadDocument(formData: FormData): any {
    const file = formData.get('file') as File;
    return this.documentsService.createDocument({
      entityType: this.entityType,
      entityId: Number(this.entityId),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      uploadedInputStream: file
    });
  }
}
