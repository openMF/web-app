/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';

/** Custom Components */
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { ClientContactInformationDialogComponent } from './client-contact-information-dialog/client-contact-information-dialog.component';

/**
 * Client Contact Information Step
 */
@Component({
  selector: 'mifosx-client-contact-information-step',
  templateUrl: './client-contact-information-step.component.html',
  styleUrls: ['./client-contact-information-step.component.scss']
})
export class ClientContactInformationStepComponent {

  /** Cient Template */
  @Input() clientTemplate: any;
  /** Client Contact Information */
  clientContactInformation: any[] = [];

  /**
   * @param {MatDialog} dialog Mat Dialog
   */
  constructor(public dialog: MatDialog) { }

  /**
   * Adds a Contact Information.
   */
  addContactInformation() {
    const addContactInformationDialogRef = this.dialog.open(ClientContactInformationDialogComponent, {
      data: {
        context: 'Add',
        options: this.clientTemplate.clientContactInformationOptions,
      },
      width: '50rem'
    });
    addContactInformationDialogRef.afterClosed().subscribe((response: any) => {
      if (response.member) {
        this.clientContactInformation.push(response.member);
      }
    });
  }

  /**
   * Deletes the Contact Information
   */
  deleteContactInformation(name: string, index: number) {
    const deleteContactInformationDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Contact Information : ${name} ${index}` }
    });
    deleteContactInformationDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientContactInformation.splice(index, 1);
      }
    });
  }

  /**
   * Returns the array of client Contact Information.
   */
  get contacts() {
    return { contacts: this.clientContactInformation };
  }

}
