/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Custom Components */

/** Custom Services */
import { ClientsService } from '../../clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { EntityNotesTabComponent } from '../../../shared/tabs/entity-notes-tab/entity-notes-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Notes Tab Component
 */
@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityNotesTabComponent
  ]
})
export class NotesTabComponent implements OnInit {
  /** Client ID */
  entityId: string;
  /** Username */
  username: string;
  /** Client Notes */
  entityNotes: any;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {ClientsService} clientsService Clients Service
   * @param {AuthenticationService} authenticationService Authentication Service
   */
  constructor(
    private route: ActivatedRoute,
    private clientsService: ClientsService,
    private authenticationService: AuthenticationService
  ) {
    this.entityId = this.route.parent.snapshot.params['clientId'];
    this.addNote = this.addNote.bind(this);
  }

  ngOnInit(): void {
    const credentials = this.authenticationService.getCredentials();
    this.username = credentials.username;
    this.route.data.subscribe((data: { clientNotes: any }) => {
      this.entityNotes = data.clientNotes;
    });
  }

  /**
   * Edits a client note.
   * @param {string} noteId Note Id
   * @param {any} noteContent Note Content
   * @param {number} index Index
   */
  editNote(noteId: string, noteContent: any, index: number) {
    this.clientsService.editClientNote(this.entityId, noteId, noteContent).subscribe(() => {
      this.entityNotes[index].note = noteContent.note;
    });
  }

  /**
   * Deletes a client note.
   * @param {string} noteId Note Id
   * @param {number} index Index
   */
  deleteNote(noteId: string, index: number) {
    this.clientsService.deleteClientNote(this.entityId, noteId).subscribe(() => {
      this.entityNotes.splice(index, 1);
    });
  }

  /**
   * Creates a client note.
   */
  addNote(noteContent: any) {
    this.clientsService.createClientNote(this.entityId, noteContent).subscribe((response: any) => {
      this.entityNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: noteContent.note
      });
    });
  }
}
