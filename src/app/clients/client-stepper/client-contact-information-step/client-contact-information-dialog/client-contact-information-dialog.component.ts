/** Angular Imports */
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';

/**
 * Client Contact Information Dialog
 */
@Component({
  selector: 'mifosx-client-contact-information-dialog',
  templateUrl: './client-contact-information-dialog.component.html',
  styleUrls: ['./client-contact-information-dialog.component.scss']
})
export class ClientContactInformationDialogComponent implements OnInit {

  /** Add/Edit family member form. */
  contactInformationForm: FormGroup;

  statusOptions: any[] = [{ value: 'Active' }, { value: 'Inactive' }];

  /**
   * @param {MatDialogRef} dialogRef Client Contact Information Dialog Reference
   * @param {FormBuilder} formBuilder Form Builder
   * @param {DatePipe} datePipe Date Pipe
   * @param {any} data Dialog Data
   * @param {SettingsService} settingsService Setting service
   */
  constructor(public dialogRef: MatDialogRef<ClientContactInformationDialogComponent>,
              private formBuilder: FormBuilder,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private settingsService: SettingsService) { }

  ngOnInit() {
    this.createContactInformationForm();
    if (this.data.context === 'Edit') {
      this.contactInformationForm.patchValue({
        'contactTypeId': this.data.member.contactTypeId,
        'contactKey': this.data.member.contactKey,
        'status': this.data.member.status,
        'current': this.data.member.current
      });
    }
  }

  /**
   * Creates Contact Information Form
   */
  createContactInformationForm() {
    this.contactInformationForm = this.formBuilder.group({
      'contactTypeId': ['', Validators.required],
      'contactKey': ['', Validators.required],
      'status': [''],
      'currentContact': ['']
    });
  }

  /**
   * Returns Formatted Contact Information
   */
  get contactInformation() {
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    // TODO: Update once language and date settings are setup
    const contactInformation = {
      ...this.contactInformationForm.value,
    };

    return contactInformation;
  }

}
