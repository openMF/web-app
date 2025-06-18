/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatSuffix, MatError } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { NgIf } from '@angular/common';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
/**
 * Create provisioning entry component.
 */
@Component({
  selector: 'mifosx-create-provisioning-entry',
  templateUrl: './create-provisioning-entry.component.html',
  styleUrls: ['./create-provisioning-entry.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    NgIf,
    MatError,
    MatCheckbox,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class CreateProvisioningEntryComponent implements OnInit {
  /** Minimum provisioning date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum provisioning date allowed. */
  maxDate = new Date();
  /** Provisioning entry form. */
  provisioningEntryForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {AccountingService} accountingService Accounting Service.
   * @param {SettingsService} settingsService Settings Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private accountingService: AccountingService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  /**
   * Creates the provisioning entry form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createProvisioningEntryForm();
  }

  /**
   * Creates the provisioning entry form.
   */
  createProvisioningEntryForm() {
    this.provisioningEntryForm = this.formBuilder.group({
      date: [
        '',
        Validators.required
      ],
      createjournalentries: [false]
    });
  }

  /**
   * Submits the provisioning entry form and creates provisioning entry,
   * if successful redirects to view created entry.
   */
  submit() {
    const provisioningEntry = this.provisioningEntryForm.value;
    // TODO: Update once language and date settings are setup
    provisioningEntry.locale = this.settingsService.language.code;
    provisioningEntry.dateFormat = this.settingsService.dateFormat;
    if (provisioningEntry.date instanceof Date) {
      provisioningEntry.date = this.dateUtils.formatDate(provisioningEntry.date, this.settingsService.dateFormat);
    }
    this.accountingService.createProvisioningEntry(provisioningEntry).subscribe((response: any) => {
      this.router.navigate(
        [
          '../view',
          response.resourceId
        ],
        { relativeTo: this.route }
      );
    });
  }
}
