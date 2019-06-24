import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { ClientsService } from '../../clients.service';
import { EditNotesDialogComponent } from '../edit-notes-dialog/edit-notes-dialog.component';

@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss']
})
export class NotesTabComponent implements OnInit {
  clientId: string;
  username: string;
  clientNotes: any;
  noteForm: FormGroup;
  @ViewChild('formRef') formRef: any;


  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private clientsService: ClientsService,
    public dialog: MatDialog) {

    this.username = JSON.parse(sessionStorage.getItem('mifosXCredentials')).username;
    this.clientId = this.route.parent.snapshot.params['clientId'];
    this.route.data.subscribe((data: { clientNotes: any }) => {
      this.clientNotes = data.clientNotes;
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
    this.clientsService.createClientNote(this.clientId, this.noteForm.value).subscribe((response: any) => {
      this.clientNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: this.noteForm.value.note
      });
      this.formRef.resetForm();
    });
  }

  editNote(noteId: string, noteContent: string, index: number) {
    const editNoteDialogRef = this.dialog.open(EditNotesDialogComponent, {
      data: { noteContent: noteContent }
    });
    editNoteDialogRef.afterClosed().subscribe((response: { editForm: any }) => {
      if (response.editForm) {
        this.clientsService.editClientNote(this.clientId, noteId, response.editForm.value).subscribe(() => {
          this.clientNotes[index].note = response.editForm.value.note;
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
        this.clientsService.deleteClientNote(this.clientId, noteId)
          .subscribe(() => {
            this.clientNotes.splice(index, 1);
          });
      }
    });
  }

}
