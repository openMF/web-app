import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { ClientsService } from '../../clients.service';

@Component({
  selector: 'mifosx-documents-tab',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss']
})
export class DocumentsTabComponent implements OnInit {
  entityDocuments: any;
  entityId: string;
  entityType = 'clients';

  constructor(private route: ActivatedRoute,
    private clientsService: ClientsService,
    public dialog: MatDialog) {
    this.route.data.subscribe((data: { clientDocuments: any }) => {
      this.entityDocuments = data.clientDocuments;
    });
    this.entityId = this.route.parent.snapshot.paramMap.get('clientId');
  }

  ngOnInit() {
  }

  downloadDocument(documentId: string) {
    this.clientsService.downloadClientDocument(this.entityId, documentId).subscribe(res => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  deleteDocument(documentId: string) {
    this.clientsService.deleteClientDocument(this.entityId, documentId).subscribe(res => {});
  }

  uploadDocument(formData: FormData): any {
    return this.clientsService.uploadClientDocument(this.entityId, formData);
  }

}
