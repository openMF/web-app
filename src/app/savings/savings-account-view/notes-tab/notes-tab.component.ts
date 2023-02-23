import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SavingsService } from 'app/savings/savings.service';

@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss']
})
export class NotesTabComponent implements OnInit {

  entityId: string;
  username: string;
  entityNotes: any;

  constructor(private route: ActivatedRoute,
    private savingsService: SavingsService,
    private authenticationService: AuthenticationService) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.entityId = this.route.snapshot.params['savingAccountId'];
    this.route.data.subscribe((data: { savingAccountNotes: any }) => {
      this.entityNotes = data.savingAccountNotes;
    });
  }

  ngOnInit() {
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
      this.savingsService.deleteSavingsNote(this.entityId, noteId)
        .subscribe(() => {
          this.entityNotes.splice(index, 1);
      });
  }

}
