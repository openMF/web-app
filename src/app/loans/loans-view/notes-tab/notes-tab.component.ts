import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { LoansService } from '../../loans.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';

@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss']
})
export class NotesTabComponent implements OnInit {

  loanId: string;
  username: string;
  loanNotes: any;
  noteForm: FormGroup;
  @ViewChild('formRef', { static: true }) formRef: any;


  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private loansService: LoansService,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.loanId = this.route.parent.snapshot.params['loanId'];
    this.route.data.subscribe((data: { loanNotes: any }) => {
      this.loanNotes = data.loanNotes;
    });
  }

  ngOnInit() {
    this.createNoteForm();
  }

  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      'note': ['', Validators.required]
    });
  }

  submit() {
    this.loansService.createLoanNote(this.loanId, this.noteForm.value).subscribe((response: any) => {
      this.loanNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: this.noteForm.value.note
      });
      this.formRef.resetForm();
    });
  }

  editNote(noteId: string, noteContent: string, index: number) {
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, {
      data: { formfields: [{
                controlName: 'note',
                required: true,
                value: noteContent,
                controlType: 'input',
                label: 'Note'
              }],
              layout: {
                columns: 1,
                addButtonText: 'Confirm'
              },
              title: 'Edit Note'
            }
    });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.loansService.editLoanNote(this.loanId, noteId, response.data.value).subscribe(() => {
          this.loanNotes[index].note = response.data.value.note;
        });
      }
    });
  }

  deleteNote(noteId: string, index: number) {
    const deleteNoteDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Note id:${noteId}` }
    });
    deleteNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.loansService.deleteLoanNote(this.loanId, noteId)
          .subscribe(() => {
            this.loanNotes.splice(index, 1);
          });
      }
    });
  }

}
