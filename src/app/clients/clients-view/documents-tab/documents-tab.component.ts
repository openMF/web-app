import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { ClientsService } from '../../clients.service';
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
    private clientsService: ClientsService,
    public dialog: MatDialog
  ) {
    this.route.data.subscribe((data: { clientDocuments: any }) => {
      this.entityDocuments = data.clientDocuments;
    });
    this.entityId = this.route.parent.snapshot.paramMap.get('clientId');
  }

  downloadDocument(documentId: string) {
    this.clientsService.downloadClientDocument(this.entityId, documentId).subscribe((res) => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  deleteDocument(documentId: string) {
    this.clientsService.deleteClientDocument(this.entityId, documentId).subscribe((res) => {});
  }

  uploadDocument(formData: FormData): any {
    return this.clientsService.uploadClientDocument(this.entityId, formData);
  }
}
