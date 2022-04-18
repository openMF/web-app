/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTable } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { ClientsService } from '../../clients.service';
import { CheckboxBase } from 'app/shared/form-dialog/formfield/model/checkbox-base';

/**
 * Contact Information Tab Component
 */
@Component({
  selector: 'mifosx-contactinformation-tab',
  templateUrl: './contactinformation-tab.component.html',
  styleUrls: ['./contactinformation-tab.component.scss']
})
export class ContactInformationTabComponent {

  /** Client Contact Information */
  clientContactInformation: any;
  /** Client Contact Information Template */
  clientContactInformationTemplate: any;
  /** Client Id */
  clientId: string;
  /** ContactInformation Columns */
  contactinformationColumns: string[] = ['id', 'type', 'value', 'status', 'current', 'actions'];

  /** Contact Information Table */
  @ViewChild('contactInformationTable', { static: true }) contactInformationTable: MatTable<Element>;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {MatDialog} dialog Mat Dialog
   * @param {ClientsService} clientService Clients Service
   */
  constructor(private route: ActivatedRoute,
              public dialog: MatDialog,
              private clientService: ClientsService) {
    this.clientId = this.route.parent.snapshot.paramMap.get('clientId');
    this.route.data.subscribe((data: { clientContactInformation: any, clientContactInformationTemplate: any }) => {
      this.clientContactInformation = data.clientContactInformation;
      this.clientContactInformationTemplate = data.clientContactInformationTemplate;
    });
  }

  /**
   * Add Client Contact Information
   */
  addContactInformation() {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'contactTypeId',
        label: 'Contact Type',
        value: '',
        options: { label: 'name', value: 'id', data: this.clientContactInformationTemplate.allowedContactTypes },
        required: true,
        order: 1
      }),
      new SelectBase({
        controlName: 'status',
        label: 'Status',
        value: '0',
        options: { label: 'value', value: 'value', data: [{ value: 'Active' }, { value: 'Inactive' }] },
        required: true,
        order: 2
      }),
      new InputBase({
        controlName: 'contactKey',
        label: 'Value',
        value: '',
        type: 'text',
        required: true,
        order: 3
      }),
      new CheckboxBase({
        controlName: 'currentContact',
        label: 'Is Current Contact?',
        value: '',
        type: 'checkbox',
        required: true,
        order: 4
      }),
    ];
    const data = {
      title: 'Add Client Contact Information',
      formfields: formfields
    };
    const addContactInformationDialogRef = this.dialog.open(FormDialogComponent, { data });
    addContactInformationDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.clientService.addClientContactInformation(this.clientId, response.data.value).subscribe((res: any) => {
          this.clientContactInformation.push({
            id: res.resourceId,
            description: response.data.value.description,
            contactType: this.clientContactInformationTemplate.allowedContactTypes.filter((doc: any) => (doc.id === response.data.value.contactTypeId))[0],
            contactKey: response.data.value.contactKey,
            contacts: [],
            clientId: this.clientId,
            status: (response.data.value.status === 'Active' ? 'clientContactInformationStatusType.active' : 'clientContactInformationStatusType.inactive')
          });
          this.contactInformationTable.renderRows();
        });
      }
    });
  }

  /**
   * Delete Client ContactInformation
   * @param {string} clientId Client Id
   * @param {string} contactId ContactInformation Id
   * @param {number} index Index
   */
  deleteContactInformation(clientId: string, contactId: string, index: number) {
    const deleteContactInformationDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `identifier id:${contactId}` }
    });
    deleteContactInformationDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientService.deleteClientContactInformation(clientId, contactId).subscribe(res => {
          this.clientContactInformation.splice(index, 1);
          this.contactInformationTable.renderRows();
        });
      }
    });
  }

}
