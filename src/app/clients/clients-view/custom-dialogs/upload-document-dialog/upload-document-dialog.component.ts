/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  OnInit,
  Output,
  inject
} from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogTitle,
  MatDialogActions,
  MatDialogClose
} from '@angular/material/dialog';
import {
  AbstractControl,
  FormControl,
  FormGroup,
  FormBuilder,
  FormGroupDirective,
  NgForm,
  ValidationErrors,
  ValidatorFn,
  Validators,
  ReactiveFormsModule
} from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { FileUploadComponent } from '../../../../shared/file-upload/file-upload.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { NepaliDateInputComponent } from 'app/shared/nepali-date-input/nepali-date-input.component';
import { CalendarName } from 'app/core/bs-calendar/calendar-preference.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * A `server` error (see applyServerError) is set programmatically from
 * outside any user interaction, so the control is never naturally
 * touched/dirty - Material's default ErrorStateMatcher (which gates the
 * red outline on touched/dirty) would otherwise leave the field
 * unstyled even though it's genuinely invalid. This shows the error
 * state immediately whenever a `server` error is present, on top of
 * the default behavior for every other error.
 */
class ServerErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const defaultErrorState = !!(control && control.invalid && (control.dirty || control.touched || form?.submitted));
    return defaultErrorState || !!control?.hasError('server');
  }
}

/** The API's [year, month, day] (or an ISO string) as a local Date, for the date fields. */
function toDate(value: number[] | string | Date | null | undefined): Date | null {
  if (!value) return null;
  if (value instanceof Date) return isNaN(value.getTime()) ? null : value;
  if (Array.isArray(value)) return new Date(value[0], value[1] - 1, value[2]);
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

/** An issue date after the expiry date is refused on the form. */
const issueNotAfterExpiry: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const issued: Date | null = group.get('issuanceDate')?.value;
  const expires: Date | null = group.get('expiryDate')?.value;
  return issued && expires && issued.getTime() > expires.getTime() ? { issueAfterExpiry: true } : null;
};

/** Upper-case extension of a file name ("PDF"), or '' when there is none. */
function extensionOf(fileName: string | null | undefined): string {
  const match = /\.([a-z0-9]{1,5})$/i.exec(fileName || '');
  return match ? match[1].toUpperCase() : '';
}

/**
 * When a document is edited, a replacement file must be the same type as the stored one.
 *
 * The server's update writes the new bytes over the stored file but keeps the stored file name (and so its
 * extension), so a JPG sent over a PDF would be previewed and downloaded as a PDF. No new file is fine.
 */
function sameTypeAs(storedFileName: string): ValidatorFn {
  const stored = extensionOf(storedFileName);
  return (control: AbstractControl): ValidationErrors | null => {
    const file: File | '' | null = control.value;
    if (!stored || !(file instanceof File)) return null;
    return extensionOf(file.name) === stored ? null : { fileType: stored };
  };
}

@Component({
  selector: 'mifosx-upload-document-dialog',
  templateUrl: './upload-document-dialog.component.html',
  styleUrls: ['./upload-document-dialog.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatDialogTitle,
    FileUploadComponent,
    MatDialogActions,
    MatDialogClose,
    NepaliDateInputComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UploadDocumentDialogComponent implements OnInit {
  /** Each date in BS and the calendar it was entered in (fineract-dbug ADR 0020). */
  issuanceDateBs: string | null = null;
  expiryDateBs: string | null = null;
  issuanceCalendar: CalendarName | null = null;
  expiryCalendar: CalendarName | null = null;
  /** An issue date can't be in the future. */
  readonly today = new Date();

  dialogRef = inject<MatDialogRef<UploadDocumentDialogComponent>>(MatDialogRef);
  private formBuilder = inject(FormBuilder);
  private translateService = inject(TranslateService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  data = inject(MAT_DIALOG_DATA);

  /** Upload Document form. */
  uploadDocumentForm: FormGroup;
  /** Shows a control as invalid immediately when it has a `server` error, regardless of touched state. */
  readonly serverErrorStateMatcher = new ServerErrorStateMatcher();
  /** Upload Document Data */
  uploadDocumentData: any = [];
  /** Triggers identity fields (documentType, status, documentKey) */
  documentIdentifier = false;
  /** Entity Type */
  entityType: string;
  /** Allowed Document Types for identifiers */
  allowedDocumentTypes: any[] = [];
  /** Status options for identifiers */
  statusOptions: any[] = [];
  /** Existing identity being edited, if any - null means "add" mode */
  identity: any = null;
  /** Existing document being edited (Documents tab), if any - null means "upload" mode */
  document: any = null;
  /**
   * The names the KYM looks for at the start of a document's name (members only), so that renaming one
   * can be flagged: the KYM would no longer count it.
   */
  kymDocumentNames: string[] = [];

  /**
   * Emitted when the user clicks Submit/Add/Upload with a valid form -
   * the dialog stays open until the caller either closes it (success)
   * or calls `applyServerError()` (failure), since a closed dialog
   * can't show a field-level or general server error.
   */
  @Output()
  submitted = new EventEmitter<any>();

  /** General (non-field-specific) server error banner text. */
  serverError: string | null = null;

  /**
   * @param {MatDialogRef} dialogRef Dialog reference element
   * @param {FormBuilder} formBuilder Form Builder
   * @param {any} data Dialog Data
   */
  constructor() {
    const data = this.data;

    this.documentIdentifier = data.documentIdentifier;
    this.entityType = data.entityType;
    this.allowedDocumentTypes = data.allowedDocumentTypes || [];
    this.statusOptions = data.statusOptions || [];
    this.identity = data.identity || null;
    this.document = data.document || null;
    this.kymDocumentNames = data.kymDocumentNames || [];
  }

  ngOnInit() {
    this.createUploadDocumentForm();
  }

  /**
   * Creates the upload Document form.
   */
  createUploadDocumentForm() {
    if (this.documentIdentifier) {
      // Unified form for identity: identifier fields + document upload.
      // When editing an existing identity, fields are pre-filled from
      // it and a new file is optional: none keeps the stored file, and
      // one chosen replaces it (identities-tab replaceIdentityDocument).
      const identity = this.identity;
      this.uploadDocumentForm = this.formBuilder.group(
        {
          documentTypeId: [
            identity ? identity.documentType?.id : '',
            Validators.required
          ],
          status: [
            identity ? (identity.status === 'clientIdentifierStatusType.active' ? 'Active' : 'Inactive') : 'Active',
            Validators.required
          ],
          documentKey: [
            identity ? identity.documentKey : '',
            Validators.required
          ],
          description: [identity ? identity.description : ''],
          issuanceDate: [toDate(identity?.issuanceDate)],
          expiryDate: [toDate(identity?.expiryDate)],
          fileName: [
            identity ? identity.documents?.[0]?.name || identity.documents?.[0]?.fileName || '' : '',
            identity ? [] : Validators.required
          ],
          file: ['']
        },
        { validators: issueNotAfterExpiry }
      );
    } else {
      // Standard document form: blank to upload, or pre-filled from the document being edited, where a
      // new file is optional (none keeps the stored file) and must be the same type as the stored one.
      const document = this.document;
      this.uploadDocumentForm = this.formBuilder.group(
        {
          fileName: [
            document?.name ?? '',
            Validators.required
          ],
          description: [document?.description ?? ''],
          issuanceDate: [toDate(document?.issuanceDate)],
          expiryDate: [toDate(document?.expiryDate)],
          file: [
            '',
            document ? sameTypeAs(document.fileName) : []
          ]
        },
        { validators: issueNotAfterExpiry }
      );
    }
  }

  /**
   * The KYM name an edited member document starts with, when the new name no longer starts with it -
   * the KYM (which matches the start of the name, in any case) would stop counting the document.
   */
  get kymNameLost(): string | null {
    const original = (this.document?.name || '').toLowerCase();
    const renamed = (this.uploadDocumentForm.get('fileName')?.value || '').toLowerCase();
    return this.kymDocumentNames.find((name) => original.startsWith(name) && !renamed.startsWith(name)) ?? null;
  }

  /**
   * Whether a description or date the edited document has was cleared. The server ignores a blank value
   * on update and keeps the stored one, so the dialog says so rather than appear to remove it.
   */
  get clearedValueKept(): boolean {
    if (!this.document) return false;
    const value = this.uploadDocumentForm.value;
    return (
      (!!this.document.description && !value.description) ||
      (!!this.document.issuanceDate && !value.issuanceDate) ||
      (!!this.document.expiryDate && !value.expiryDate)
    );
  }

  /**
   * Sets file form control value and auto-fills fileName.
   * @param {any} $event file change event.
   */
  onFileSelect($event: any) {
    if ($event.target.files.length > 0) {
      const file = $event.target.files[0];
      this.uploadDocumentForm.get('file').setValue(file);
      if (this.documentIdentifier || !this.uploadDocumentForm.get('fileName').value) {
        this.uploadDocumentForm.get('fileName').setValue(file.name);
      }
    }
  }

  /**
   * Fields the API can report a `parameterName` error against - only
   * these get an inline field error; anything else falls back to the
   * general banner (`serverError`).
   */
  private readonly serverErrorFields = [
    'documentTypeId',
    'documentKey',
    'status',
    'description',
    'issuanceDate',
    'expiryDate'
  ];

  /**
   * Submit handler for both forms this dialog renders. For the
   * identifier form (documentIdentifier), this emits instead of
   * closing - the caller (identities-tab) makes the actual API call
   * and only closes the dialog on success, so a failure can be shown
   * right here without losing what the user typed. The plain document
   * upload form has no server-side error handling wired up yet, so it
   * keeps its previous behavior of closing immediately with the form
   * value. Editing a document (Documents tab) emits too, like an identity,
   * so an error from the update is shown here.
   */
  onSubmitClick(): void {
    if (!this.documentIdentifier && !this.document) {
      this.dialogRef.close(this.valueWithBsDates());
      return;
    }

    this.serverError = null;
    this.serverErrorFields.forEach((name) => this.uploadDocumentForm.get(name)?.updateValueAndValidity());

    this.submitted.emit(this.valueWithBsDates());
  }

  /**
   * The form value plus each date in BS (fineract-dbug ADR 0020): the BS date to keep, or null when it was typed in AD
   * (an AD-typed date has no BS original) or is outside the BS calendar.
   */
  private valueWithBsDates(): any {
    return {
      ...this.uploadDocumentForm.value,
      issuanceDateBs: this.issuanceCalendar === 'AD' ? null : this.issuanceDateBs,
      expiryDateBs: this.expiryCalendar === 'AD' ? null : this.expiryDateBs
    };
  }

  /**
   * Called by the caller when the API rejects the submitted data.
   * Attaches the error to the specific control when the API names one
   * (`errors[0].parameterName`), otherwise shows it as a general
   * banner - covers things like "No parameters passed for update",
   * which isn't about any one field.
   *
   * `messageOverride` lets the caller replace the backend's own
   * message - needed for errors like identityKey.duplicate, whose
   * `defaultUserMessage` names another client's own name/branch/document
   * key, which must never be shown to the person creating this one.
   */
  applyServerError(err: any, messageOverride?: string): void {
    const apiError = err?.error?.errors?.[0];
    const message: string =
      messageOverride ??
      apiError?.defaultUserMessage ??
      err?.error?.defaultUserMessage ??
      'Something went wrong. Please try again.';

    const control = apiError?.parameterName ? this.uploadDocumentForm.get(apiError.parameterName) : null;

    if (control) {
      control.setErrors({ server: message });
      // Angular Material only shows the red invalid state (outline +
      // underline) once a control is both invalid AND touched. This is
      // set programmatically, outside any blur/interaction, so without
      // this the field stays invalid but visually unstyled - only the
      // mat-error text below it would show.
      control.markAsTouched();
    } else {
      this.serverError = message;
    }

    // This dialog is OnPush and this method is called from outside it
    // (the caller's async HTTP error callback, not a template-bound
    // event on this component) - without this, the error is set
    // correctly in memory but the dialog never repaints to show it.
    this.changeDetectorRef.markForCheck();
  }
}
