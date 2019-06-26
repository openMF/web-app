import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material';

/** Custom Services */
import { ClientsService } from '../../clients.service';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';


@Component({
  selector: 'mifosx-documents-tab',
  templateUrl: './documents-tab.component.html',
  styleUrls: ['./documents-tab.component.scss']
})
export class DocumentsTabComponent implements OnInit {
  @ViewChild('documentsTable') documentsTable: MatTable<Element>;
  documentsColumns: string[] = ['name', 'description', 'fileName', 'actions'];
  clientDocuments: any;


  constructor(private route: ActivatedRoute,
    private clientService: ClientsService,
    public dialog: MatDialog) {
    this.route.data.subscribe((data: { clientDocuments: any }) => {
      this.clientDocuments = data.clientDocuments;
    });
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
    const deleteFamilyMemberDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `document id:${documentId}` }
    });
    deleteFamilyMemberDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientService.deleteClientDocument(parentEntityId, documentId).subscribe(res => {
          this.clientDocuments.splice(index, 1);
          this.documentsTable.renderRows();
        });
      }
    });
  }

}
