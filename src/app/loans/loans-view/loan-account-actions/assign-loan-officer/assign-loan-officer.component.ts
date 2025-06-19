import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCard, MatCardContent, MatCardActions } from '@angular/material/card';
import { MatFormField, MatLabel, MatError, MatSuffix } from '@angular/material/form-field';
import { MatSelect } from '@angular/material/select';
import { NgFor, NgIf } from '@angular/common';
import { MatOption } from '@angular/material/autocomplete';
import { MatInput } from '@angular/material/input';
import { MatDatepickerInput, MatDatepickerToggle, MatDatepicker } from '@angular/material/datepicker';
import { MatButton } from '@angular/material/button';
import { HasPermissionDirective } from '../../../../directives/has-permission/has-permission.directive';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

@Component({
  selector: 'mifosx-assign-loan-officer',
  templateUrl: './assign-loan-officer.component.html',
  styleUrls: ['./assign-loan-officer.component.scss'],
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
    MatCardActions,
    MatButton,
    RouterLink,
    HasPermissionDirective,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class AssignLoanOfficerComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  loanOfficers: any[];
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Assign loan Officer form. */
  assignOfficerForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor(
    private formBuilder: UntypedFormBuilder,
    private loanService: LoansService,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private settingsService: SettingsService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the assign officer form.
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createassignOfficerForm();
    this.loanOfficers = this.dataObject.loanOfficerOptions;
  }

  /**
   * Creates the create close form.
   */
  createassignOfficerForm() {
    this.assignOfficerForm = this.formBuilder.group({
      toLoanOfficerId: [
        '',
        Validators.required
      ],
      assignmentDate: [
        new Date(),
        Validators.required
      ]
    });
  }

  submit() {
    const assignOfficerFormData = this.assignOfficerForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const assignmentDate = this.assignOfficerForm.value.assignmentDate;
    if (assignOfficerFormData.assignmentDate instanceof Date) {
      assignOfficerFormData.assignmentDate = this.dateUtils.formatDate(assignmentDate, dateFormat);
    }
    const data = {
      ...assignOfficerFormData,
      dateFormat,
      locale
    };
    data.fromLoanOfficerId = this.dataObject.loanOfficerId || '';
    this.loanService.loanActionButtons(this.loanId, 'assignLoanOfficer', data).subscribe((response: any) => {
      this.router.navigate([`../../general`], { relativeTo: this.route });
    });
  }
}
