/** Angular Imports */
import { Component, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

/** Custom Services */
import { AccountingService } from '../../accounting.service';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
/**
 * Create closure component.
 */
@Component({
  selector: 'mifosx-create-closure',
  templateUrl: './create-closure.component.html',
  styleUrls: ['./create-closure.component.scss'],
  imports: [
    MatCard,
    ReactiveFormsModule,
    MatCardContent,
    MatFormField,
    MatLabel,
    MatSelect,
    NgFor,
    MatOption,
    NgIf,
    MatError,
    MatInput,
    MatDatepickerInput,
    MatDatepickerToggle,
    MatSuffix,
    MatDatepicker,
    CdkTextareaAutosize,
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class CreateClosureComponent implements OnInit {
  /** Minimum closing date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum closing date allowed. */
  maxDate = new Date();
  /** Accounting closure form. */
  accountingClosureForm: UntypedFormGroup;
  /** Office data. */
  officeData: any;

  /**
   * Retrieves the offices data from `resolve`.
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
  ) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officeData = data.offices;
    });
  }

  /**
   * Creates the accounting closure form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createAccountingClosureForm();
  }

  /**
   * Creates the accounting closure form.
   */
  createAccountingClosureForm() {
    this.accountingClosureForm = this.formBuilder.group({
      officeId: [
        '',
        Validators.required
      ],
      closingDate: [
        '',
        Validators.required
      ],
      comments: ['']
    });
  }

  /**
   * Submits the accounting closure form and creates accounting closure,
   * if successful redirects to view created closure.
   */
  submit() {
    const accountingClosure = this.accountingClosureForm.value;
    // TODO: Update once language and date settings are setup
    accountingClosure.locale = this.settingsService.language.code;
    accountingClosure.dateFormat = this.settingsService.dateFormat;
    if (accountingClosure.closingDate) {
      accountingClosure.closingDate = this.dateUtils.formatDate(
        accountingClosure.closingDate,
        this.settingsService.dateFormat
      );
    }
    this.accountingService.createAccountingClosure(accountingClosure).subscribe((response: any) => {
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
