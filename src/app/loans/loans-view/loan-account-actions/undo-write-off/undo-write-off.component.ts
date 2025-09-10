/** Angular Imports */
import { Component, OnInit, Input } from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

/** Custom Services */
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { AlertService } from 'app/core/alert/alert.service';
import { Dates } from 'app/core/utils/dates';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Loan Undo Write-off Action
 */
@Component({
  selector: 'mifosx-undo-write-off',
  templateUrl: './undo-write-off.component.html',
  styleUrls: ['./undo-write-off.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    CdkTextareaAutosize
  ]
})
export class UndoWriteOffComponent implements OnInit {
  @Input() dataObject: any;
  /** Loan Id */
  loanId: string;
  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  /** Undo Write-off Loan Form */
  undoWriteOffLoanForm: UntypedFormGroup;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} loanService Loan Service.
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
    private settingsService: SettingsService,
    private alertService: AlertService
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  /**
   * Creates the undo write-off loan form
   * and initialize with the required values
   */
  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.createUndoWriteOffLoanForm();
  }

  /**
   * Creates the undo write-off loan form
   */
  createUndoWriteOffLoanForm() {
    this.undoWriteOffLoanForm = this.formBuilder.group({
      note: ['']
    });
  }

  /** Submits the undo write-off form */
  submit() {
    const undoWriteOffLoanFormData = this.undoWriteOffLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const operationDate = this.settingsService.businessDate;
    const data = {
      ...undoWriteOffLoanFormData,
      transactionDate: this.dateUtils.formatDate(operationDate && new Date(operationDate), dateFormat),
      transactionAmount: 0,
      dateFormat,
      locale
    };

    this.loanService.submitLoanActionButton(this.loanId, data, 'undowriteoff').subscribe({
      next: (response: any) => {
        this.router.navigate(['../../general'], { relativeTo: this.route });
      },
      error: (error) => {
        console.error('Undo write-off failed:', error);
        this.alertService.alert({
          type: 'Undo Write-off Failed',
          message:
            'An error occurred while processing the undo write-off transaction. Please try again or contact support if the problem persists.'
        });
      }
    });
  }
}
