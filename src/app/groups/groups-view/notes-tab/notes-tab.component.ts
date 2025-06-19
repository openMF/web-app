/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Custom Services */
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { GroupsService } from '../../groups.service';
import { EntityNotesTabComponent } from '../../../shared/tabs/entity-notes-tab/entity-notes-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Custom Dialogs */

/**
 * Groups Notes Tab Component.
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
  /** Group ID */
  entityId: string;
  /** Username */
  username: string;
  /** Client Notes */
  entityNotes: any;

  /**
   * Fetches notes data from `resolve`
   * @param {Activated Route} route Activated Route.
   * @param {GroupsService} groupsService Groups Service
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    private groupsService: GroupsService
  ) {
    this.entityId = this.route.parent.snapshot.params['groupId'];
    this.addNote = this.addNote.bind(this);
  }

  ngOnInit() {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.route.data.subscribe((data: { groupNotes: any }) => {
      this.entityNotes = data.groupNotes;
    });
  }

  /**
   * Adds a new note.
   */
  addNote(noteContent: any) {
    this.groupsService.createGroupNote(this.entityId, noteContent).subscribe((response: any) => {
      this.entityNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: noteContent.note
      });
    });
  }

  /**
   * Edits selected note.
   * @param {string} noteId Note Id.
   * @param {any} noteContent Note's content.
   */
  editNote(noteId: string, noteContent: any, index: number) {
    this.groupsService.editGroupNote(this.entityId, noteId, noteContent).subscribe(() => {
      this.entityNotes[index].note = noteContent.note;
    });
  }

  /**
   * Delets the given note.
   * @param {string} noteId Note Id.
   */
  deleteNote(noteId: string, index: number) {
    this.groupsService.deleteGroupNote(this.entityId, noteId).subscribe(() => {
      this.entityNotes.splice(index, 1);
    });
  }
}
