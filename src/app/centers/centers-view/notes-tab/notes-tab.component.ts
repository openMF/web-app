import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Components */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Services */
import { CentersService } from '../../centers.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';

@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss']
})
export class NotesTabComponent implements OnInit {
  centerId: string;
  username: string;
  centerNotes: any;
  noteForm: FormGroup;
  @ViewChild('formRef', { static: true }) formRef: any;


  constructor(private route: ActivatedRoute,
    private formBuilder: FormBuilder,
    private centersService: CentersService,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.centerId = this.route.parent.snapshot.params['centerId'];
    this.route.data.subscribe((data: { centerNotes: any }) => {
      this.centerNotes = data.centerNotes;
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
    this.centersService.createCenterNote(this.centerId, this.noteForm.value).subscribe((response: any) => {
      this.centerNotes.push({
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
        this.centersService.editCenterNote(this.centerId, noteId, response.data.value).subscribe(() => {
          this.centerNotes[index].note = response.data.value.note;
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
        this.centersService.deleteCenterNote(this.centerId, noteId)
          .subscribe(() => {
            this.centerNotes.splice(index, 1);
          });
      }
    });
  }
}
