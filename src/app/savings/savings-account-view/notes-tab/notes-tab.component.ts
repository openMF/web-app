import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SavingsService } from 'app/savings/savings.service';
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
export class NotesTabComponent {
  entityId: string;
  username: string;
  entityNotes: any;

  constructor(
    private route: ActivatedRoute,
    private savingsService: SavingsService,
    private authenticationService: AuthenticationService
  ) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.entityId = this.route.parent.snapshot.params['savingAccountId'];
    this.route.data.subscribe((data: { savingAccountNotes: any }) => {
      this.entityNotes = data.savingAccountNotes;
    });
  }

  addNote(noteContent: any) {
    this.savingsService.createSavingsNote(this.entityId, noteContent).subscribe((response: any) => {
      this.entityNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: noteContent.note
      });
    });
  }

  editNote(noteId: string, noteContent: any, index: number) {
    this.savingsService.editSavingsNote(this.entityId, noteId, noteContent).subscribe(() => {
      this.entityNotes[index].note = noteContent.note;
    });
  }

  deleteNote(noteId: string, index: number) {
    this.savingsService.deleteSavingsNote(this.entityId, noteId).subscribe(() => {
      this.entityNotes.splice(index, 1);
    });
  }
}
