import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material';
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/** Custom Components */
import { UploadDocumentDialogComponent } from '../custom-dialogs/upload-document-dialog/upload-document-dialog.component';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

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
  clientIdentifierTemplate: any;
  clientId: string;

  constructor(private route: ActivatedRoute,
    public dialog: MatDialog,
    private clientService: ClientsService) {
    this.clientId = this.route.parent.snapshot.paramMap.get('clientId');
    this.route.data.subscribe((data: { clientIdentities: any, clientIdentifierTemplate: any }) => {
      this.clientIdentities = data.clientIdentities;
      this.clientIdentifierTemplate = data.clientIdentifierTemplate;
    });
  }

  ngOnInit() { }

  download(parentEntityId: string, documentId: string) {
    this.clientService.downloadClientIdentificationDocument(parentEntityId, documentId).subscribe(res => {
      const url = window.URL.createObjectURL(res);
      window.open(url);
    });
  }

  addIdentifier() {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'documentTypeId',
        label: 'Document Type',
        value: '',
        options: { label: 'name', value: 'id', data: this.clientIdentifierTemplate.allowedDocumentTypes },
        required: true,
        order: 1
      }),
      new SelectBase({
        controlName: 'status',
        label: 'Status',
        value: '2',
        options: { label: 'value', value: 'value', data: [{ value: 'Active' }, { value: 'Inactive' }] },
        required: true,
        order: 2
      }),
      new InputBase({
        controlName: 'documentKey',
        label: 'Unique Id',
        value: '',
        type: 'text',
        required: true,
        order: 3
      }),
      new InputBase({
        controlName: 'description',
        label: 'Description',
        value: '',
        type: 'text',
        order: 4
      })
    ];
    const data = {
      title: 'Add Client Identifier',
      formfields: formfields
    };
    const addIdentifierDialogRef = this.dialog.open(FormDialogComponent, { data });
    addIdentifierDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.clientService.addClientIdentifier(this.clientId, response.data.value).subscribe((res: any) => {
          this.clientIdentities.push({
            id: res.resourceId,
            description: response.data.value.description,
            documentType: this.clientIdentifierTemplate.allowedDocumentTypes.filter((doc: any) => (doc.id === response.data.value.documentTypeId))[0],
            documentKey: response.data.value.documentKey,
            documents: [],
            clientId: this.clientId,
            status: (response.data.value.status === 'Active' ? 'clientIdentifierStatusType.active' : 'clientIdentifierStatusType.inactive')
          });
          this.identifiersTable.renderRows();
        });
      }
    });
  }

  deleteIdentifier(clientId: string, identifierId: string, index: number) {
    const deleteIdentifierDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `identifier id:${identifierId}` }
    });
    deleteIdentifierDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientService.deleteClientIdentifier(clientId, identifierId).subscribe(res => {
          this.clientIdentities.splice(index, 1);
          this.identifiersTable.renderRows();
        });
      }
    });
  }

  uploadDocument(index: number, identifierId: string) {
    const uploadDocumentDialogRef = this.dialog.open(UploadDocumentDialogComponent, {
      data: { documentIdentifier: true }
    });
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
            fileName: dialogResponse.file.name
          });
          this.identifiersTable.renderRows();
        });
      }
    });
  }

}
