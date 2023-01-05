import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Custom Components */

/** Custom Services */
import { LoansService } from '../../loans.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';

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
    private loansService: LoansService,
    private authenticationService: AuthenticationService) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.entityId = this.route.parent.snapshot.params['loanId'];
    this.route.data.subscribe((data: { loanNotes: any }) => {
      this.entityNotes = data.loanNotes;
    });
  }

  ngOnInit() { }

  addNote(noteContent: any) {
    this.loansService.createLoanNote(this.entityId, noteContent).subscribe((response: any) => {
      this.entityNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: noteContent.note
      });
    });
  }

  editNote(noteId: string, noteContent: any, index: number) {
    this.loansService.editLoanNote(this.entityId, noteId, noteContent).subscribe(() => {
      this.entityNotes[index].note = noteContent.note;
    });
  }

  deleteNote(noteId: string, index: number) {
    this.loansService.deleteLoanNote(this.entityId, noteId)
      .subscribe(() => {
        this.entityNotes.splice(index, 1);
    });
  }

}
