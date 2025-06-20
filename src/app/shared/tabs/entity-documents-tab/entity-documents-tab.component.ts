import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import {
  MatTable,
  MatTableDataSource,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { UploadDocumentDialogComponent } from 'app/clients/clients-view/custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { ClientsService } from 'app/clients/clients.service';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { Observable } from 'rxjs';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-entity-documents-tab',
  templateUrl: './entity-documents-tab.component.html',
  styleUrls: ['./entity-documents-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator
  ]
})
export class EntityDocumentsTabComponent implements OnInit {
  @ViewChild('documentsTable', { static: true }) documentsTable: MatTable<Element>;

  @Input() entityId: string;
  @Input() entityType: string;
  @Input() entityDocuments: any;

  @Input() callbackUpload: (documentData: FormData) => Observable<any>;
  @Input() callbackDownload: (documentId: string) => void;
  @Input() callbackDelete: (documentId: string) => void;

  /** Status of the loan account */
  status: any;
  /** Choice */
  choice: boolean;

  /** Columns to be displayed in loan documents table. */
  displayedColumns: string[] = [
    'name',
    'description',
    'filename',
    'actions'
  ];
  /** Data source for loan documents table. */
  dataSource: MatTableDataSource<any>;

  /** Paginator for codes table. */
  @ViewChild(MatPaginator) paginator: MatPaginator;
  /** Sorter for codes table. */
  @ViewChild(MatSort) sort: MatSort;

  /**
   *
   * @param {MatDialog} dialog Dialog for Inputs.
   * @param {SavingsService} savingsService Savings Account services.
   * @param {LoansService} loansService Loan Account services.
   * @param {ClientsService} clientsService Client services.
   */
  constructor(
    public dialog: MatDialog,
    private savingsService: SavingsService,
    private loansService: LoansService,
    private clientsService: ClientsService
  ) {}

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.entityDocuments);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  downloadDocument(documentId: string) {
    this.callbackDownload(documentId);
  }

  uploadDocument() {
    const uploadDocumentDialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: { documentIdentifier: false, entityType: '' },
      width: '33rem'
    });
    uploadDocumentDialogRef.afterClosed().subscribe((dialogResponse: any) => {
      if (dialogResponse) {
        const formData: FormData = new FormData();
        formData.append('name', dialogResponse.fileName);
        formData.append('file', dialogResponse.file);
        formData.append('description', dialogResponse.description);
        this.callbackUpload(formData).subscribe((res: any) => {
          this.entityDocuments.push({
            id: res.resourceId,
            parentEntityType: this.entityType,
            parentEntityId: this.entityId,
            name: dialogResponse.fileName,
            description: dialogResponse.description,
            fileName: dialogResponse.file.name
          });
          this.documentsTable.renderRows();
        });
      }
    });
  }

  deleteDocument(documentId: string, name: number) {
    const deleteDocumentDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Document: ${name}` }
    });
    deleteDocumentDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.callbackDelete(documentId);
        for (let i = 0; i < this.entityDocuments.length; i++) {
          if (this.entityDocuments[i].id === documentId) {
            this.entityDocuments.splice(i, 1);
          }
        }
        this.documentsTable.renderRows();
      }
    });
  }
}
