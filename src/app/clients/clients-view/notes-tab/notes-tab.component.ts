/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { EditNotesDialogComponent } from '../custom-dialogs/edit-notes-dialog/edit-notes-dialog.component';

/** Custom Services */
import { ClientsService } from '../../clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { MatomoTracker } from "@ngx-matomo/tracker";

/**
 * Notes Tab Component
 */
@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss']
})
export class NotesTabComponent implements OnInit {

  /** Client ID */
  clientId: string;
  /** Username */
  username: string;
  /** Client Notes */
  clientNotes: any;
  /** Note Form */
  noteForm: UntypedFormGroup;

  /** Notes Form Reference */
  @ViewChild('formRef', { static: true }) formRef: any;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {FormBuilder} formBuilder Form Builder
   * @param {ClientsService} clientsService Clients Service
   * @param {AuthenticationService} authenticationService Authentication Service
   * @param {MatDialog} dialog Mat Dialog
   * @param {MatomoTracker} matomoTracker Matomo tracker service
   */
  constructor(private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private clientsService: ClientsService,
    private authenticationService: AuthenticationService,
    public dialog: MatDialog,
    private matomoTracker: MatomoTracker) {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
    this.clientId = this.route.parent.snapshot.params['clientId'];
    this.route.data.subscribe((data: { clientNotes: any }) => {
      this.clientNotes = data.clientNotes;
    });
  }

  ngOnInit() {

    //set Matomo page info
    let title = document.title;
    this.matomoTracker.setDocumentTitle(`${title}`);

    this.createNoteForm();
  }

  /**
   * Creates the note form
   */
  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      'note': ['', Validators.required]
    });
  }

  /**
   * Edits a client note.
   * @param {string} noteId Note Id
   * @param {string} noteContent Note Content
   * @param {number} index Index
   */
  editNote(noteId: string, noteContent: string, index: number) {

    //Matomo log activity
    this.matomoTracker.trackEvent('clients', 'updateClientNote', this.clientId);// change to track right info

    const editNoteDialogRef = this.dialog.open(EditNotesDialogComponent, {
      data: { noteContent: noteContent }
    });
    editNoteDialogRef.afterClosed().subscribe((response: { editForm: any }) => {
      if (response.editForm) {
        this.clientsService.editClientNote(this.clientId, noteId, response.editForm.value).subscribe(() => {
          this.clientNotes[index].note = response.editForm.value.note;
        });

        //Matomo log activity
        this.matomoTracker.trackEvent('clients', 'updateClientNoteSuccess', this.clientId);// change to track right info

      }
    });
  }

  /**
   * Deletes a client note.
   * @param {string} noteId Note Id
   * @param {number} index Index
   */
  deleteNote(noteId: string, index: number) {
    //Matomo log activity
    this.matomoTracker.trackEvent('clients', 'deleteClientNote', this.clientId);// change to track right info

    const deleteNoteDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Note id:${noteId}` }
    });
    deleteNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.clientsService.deleteClientNote(this.clientId, noteId)
          .subscribe(() => {
            this.clientNotes.splice(index, 1);
          });

        //Matomo log activity
        this.matomoTracker.trackEvent('clients', 'deleteClientNoteSuccess', this.clientId);// change to track right info

      }
    });
  }

  /**
   * Creates a client note.
   */
  submit() {
    //Matomo log activity
    this.matomoTracker.trackEvent('clients', 'createClientNote', this.clientId);// change to track right info

    this.clientsService.createClientNote(this.clientId, this.noteForm.value).subscribe((response: any) => {
      //Matomo log activity
      this.matomoTracker.trackEvent('clients', 'createClientNoteSuccess',response.resourceId);// change to track right info

      this.clientNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: this.noteForm.value.note
      });
      this.formRef.resetForm();
    });
  }

}
