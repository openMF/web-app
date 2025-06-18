import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';

/** Custom Components */
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { DeleteDialogComponent } from '../../../shared/delete-dialog/delete-dialog.component';

/** Custom Services */
import { TranslateService } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { CentersService } from '../../centers.service';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { MatButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatList, MatListItem } from '@angular/material/list';
import { NgFor } from '@angular/common';
import { MatLine } from '@angular/material/grid-list';
import { DateFormatPipe } from '../../../pipes/date-format.pipe';

@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatInput,
    HasPermissionDirective,
    MatButton,
    FaIconComponent,
    MatList,
    NgFor,
    MatListItem,
    MatLine,
    TranslatePipe,
    DateFormatPipe,
    NgxTranslatePipe
  ]
})
export class NotesTabComponent implements OnInit {
  centerId: string;
  username: string;
  centerNotes: any;
  noteForm: UntypedFormGroup;
  @ViewChild('formRef', { static: true }) formRef: any;

  constructor(
    private route: ActivatedRoute,
    private formBuilder: UntypedFormBuilder,
    private centersService: CentersService,
    private authenticationService: AuthenticationService,
    private dialog: MatDialog,
    private translateService: TranslateService
  ) {
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
      note: [
        '',
        Validators.required
      ]
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
      data: {
        formfields: [
          {
            controlName: 'note',
            required: true,
            value: noteContent,
            controlType: 'input',
            label: this.translateService.instant('labels.inputs.Note')
          }
        ],
        layout: {
          columns: 1,
          addButtonText: 'Confirm'
        },
        title: this.translateService.instant('labels.heading.Edit Note')
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
      data: {
        deleteContext: `${this.translateService.instant('labels.inputs.Note')} ${this.translateService.instant('labels.inputs.Id')}:${noteId}`
      }
    });
    deleteNoteDialogRef.afterClosed().subscribe((response: any) => {
      if (response.delete) {
        this.centersService.deleteCenterNote(this.centerId, noteId).subscribe(() => {
          this.centerNotes.splice(index, 1);
        });
      }
    });
  }
}
