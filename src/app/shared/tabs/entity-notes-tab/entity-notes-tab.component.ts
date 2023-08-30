import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ClientsService } from 'app/clients/clients.service';
import { GroupsService } from 'app/groups/groups.service';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

@Component({
  selector: 'mifosx-entity-notes-tab',
  templateUrl: './entity-notes-tab.component.html',
  styleUrls: ['./entity-notes-tab.component.scss']
})
export class EntityNotesTabComponent implements OnInit {

  @ViewChild('formRef', { static: true }) formRef: any;

  @Input() entityId: string;
  @Input() entityNotes: any;

  @Input() callbackAdd: (note: any) => void;
  @Input() callbackEdit: (noteId: string, note: string, index: number) => void;
  @Input() callbackDelete: (noteId: string, index: number) => void;

  noteForm: UntypedFormGroup;

  constructor(private formBuilder: UntypedFormBuilder,
    private savingsService: SavingsService,
    private loansService: LoansService,
    private clientsService: ClientsService,
    private groupsService: GroupsService,
    private dialog: MatDialog) { }

  ngOnInit() {
    this.createNoteForm();
  }

  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      'note': ['', Validators.required]
    });
  }

  addNote() {
    this.callbackAdd(this.noteForm.value);
    this.formRef.resetForm();
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
      if (response.data && response.data.value.note !== noteContent) {
        this.callbackEdit(noteId, response.data.value, index);
      }
    });
  }

  deleteNote(noteId: string, index: number) {
    const deleteNoteDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Note: ${this.entityNotes[index].note}` }
    });
    deleteNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.callbackDelete(noteId, index);
      }
    });
  }

}
