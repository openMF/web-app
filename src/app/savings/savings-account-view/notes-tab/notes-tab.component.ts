import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { NotesService } from '@fineract/client';
import { EntityNotesTabComponent } from '../../../shared/tabs/entity-notes-tab/entity-notes-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

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
  entityId: string;
  username: string;
  entityNotes: any;

  /**
   * Add a note.
   * @param {string} noteContent Note content.
   */
  addNote = (noteContent: string) => {
    return this.notesService.addNewNote({
      resourceType: 'savings',
      resourceId: parseInt(this.entityId, 10),
      noteRequest: { note: noteContent }
    });
  };

  /**
   * Edit a note.
   * @param {string} noteId Note ID.
   * @param {string} noteContent Note content.
   */
  editNote = (noteId: string, noteContent: string) => {
    return this.notesService.updateNote({
      resourceType: 'savings',
      resourceId: parseInt(this.entityId, 10),
      noteId: parseInt(noteId, 10),
      noteRequest: { note: noteContent }
    });
  };

  /**
   * Delete a note.
   * @param {string} noteId Note ID.
   */
  deleteNote = (noteId: string) => {
    return this.notesService.deleteNote({
      resourceType: 'savings',
      resourceId: parseInt(this.entityId, 10),
      noteId: parseInt(noteId, 10)
    });
  };

  constructor(
    private route: ActivatedRoute,
    private notesService: NotesService,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.entityId = this.route.parent.snapshot.params['savingAccountId'];
    this.route.data.subscribe((data: { savingAccountNotes: any }) => {
      this.entityNotes = data.savingAccountNotes;
    });
  }
}
