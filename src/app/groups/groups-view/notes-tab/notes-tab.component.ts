/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';

/** Custom Services */
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { GroupsService } from '../../groups.service';

/** Custom Dialogs */
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';

/**
 * Groups Notes Tab Component.
 */
@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss']
})
export class NotesTabComponent implements OnInit {

  /** Group Notes */
  groupNotes: any;
  /** Group Id */
  groupId: string;
  /** User Name */
  username: string;
  /** Note form */
  noteForm: FormGroup;

  /** Note Form Reference */
  @ViewChild('formRef', { static: true }) formRef: any;

  /**
   * Fetches notes data from `resolve`
   * @param {Activated Route} route Activated Route.
   * @param {FormBuilder} formBuilder FormBuilder
   * @param {GroupsService} groupsService Groups Service
   * @param {MatDialog} dialog MatDialog
   * @param {AuthenticationService} authenticationService Authentication Service.
   */
  constructor(private route: ActivatedRoute,
              private formBuilder: FormBuilder,
              private authenticationService: AuthenticationService,
              private groupsService: GroupsService,
              public dialog: MatDialog) {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.groupId = this.route.parent.snapshot.params['groupId'];
    this.route.data.subscribe((data: { groupNotes: any }) => {
      this.groupNotes = data.groupNotes;
    });
  }

  ngOnInit() {
    this.createNoteForm();
  }

  /**
   * Creates the note form.
   */
  createNoteForm() {
    this.noteForm = this.formBuilder.group({
      'note': ['', Validators.required]
    });
  }

  /**
   * Adds a new note.
   */
  addNote() {
    this.groupsService.createGroupNote(this.groupId, this.noteForm.value).subscribe((response: any) => {
      this.groupNotes.push({
        id: response.resourceId,
        createdByUsername: this.username,
        createdOn: new Date(),
        note: this.noteForm.value.note
      });
      this.formRef.resetForm();
    });
  }

  /**
   * Edits selected note.
   * @param {string} noteId Note Id.
   * @param {string} noteContent Note's content.
   * @param {number} index  Index of note.
   */
  editNote(noteId: string, noteContent: string, index: number) {
    const formfields: FormfieldBase[] = [
      new InputBase({
        controlName: 'note',
        label: 'Note',
        value: noteContent,
        type: 'text',
        required: true,
      }),
    ];
    const data = {
      title: 'Edit Note',
      layout: { addButtonText: 'Confirm' },
      formfields: formfields
    };
    const editNoteDialogRef = this.dialog.open(FormDialogComponent, { data });
    editNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.data) {
        this.groupsService.editGroupNote(this.groupId, noteId, response.data.value).subscribe(() => {
          this.groupNotes[index].note = response.data.value.note;
        });
      }
    });
  }

  /**
   * Delets the given note.
   * @param {string} noteId Note Id.
   * @param {number} index Index of Note.
   */
  deleteNote(noteId: string, index: number) {
    const deleteNoteDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: `Note id:${noteId}` }
    });
    deleteNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.groupsService.deleteGroupNote(this.groupId, noteId).subscribe(() => {
          this.groupNotes.splice(index, 1);
        });
      }
    });
  }

}
