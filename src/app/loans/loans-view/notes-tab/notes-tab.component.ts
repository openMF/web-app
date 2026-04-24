import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

/** Custom Components */

/** Custom Services */
import { LoansService as CustomLoansService } from 'app/customApis.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
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

  constructor(
    private route: ActivatedRoute,
    private customLoansService: CustomLoansService,
    private authenticationService: AuthenticationService
  ) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.entityId = this.route.parent.snapshot.params['loanId'];
    this.route.data.subscribe((data: { loanNotes: any }) => {
      this.entityNotes = data.loanNotes;
    });
  }

  ngOnInit(): void {
    this.route.parent.params.subscribe((params) => {
      this.entityId = params['loanId'];
    });
  }

  addNote = (noteContent: any) => {
    this.customLoansService.createLoanNote(this.entityId, noteContent).subscribe((response: any) => {
      this.entityNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: noteContent.note
      });
    });
  };

  editNote = (noteId: string, noteContent: any, index: number) => {
    this.customLoansService.editLoanNote(this.entityId, noteId, noteContent).subscribe(() => {
      this.entityNotes[index].note = noteContent.note;
    });
  };

  deleteNote = (noteId: string, index: number) => {
    this.customLoansService.deleteLoanNote(this.entityId, noteId).subscribe(() => {
      this.entityNotes.splice(index, 1);
    });
  };
}
