import { Component, OnInit, Input, inject, DestroyRef } from '@angular/core';
import { LoansService } from 'app/loans/loans.service';
import {
  UntypedFormBuilder,
  UntypedFormGroup,
  Validators,
  UntypedFormControl,
  ReactiveFormsModule
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

/** Custom Services */
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';
import { MatCheckbox } from '@angular/material/checkbox';
import { PenaltyManagementService } from 'app/loans/services/penalty-management.service';
import { FormatNumberPipe } from '../../../../pipes/format-number.pipe';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'mifosx-loan-reschedule',
  templateUrl: './loan-reschedule.component.html',
  styleUrls: ['./loan-reschedule.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatCheckbox,
    FormatNumberPipe
  ]
})
export class LoanRescheduleComponent implements OnInit {
  private formBuilder = inject(UntypedFormBuilder);
  private loanService = inject(LoansService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dateUtils = inject(Dates);
  private settingsService = inject(SettingsService);
  private penaltyManagementService = inject(PenaltyManagementService);
  private destroyRef = inject(DestroyRef);

  @Input() dataObject: any;
  loanId: any;
  rescheduleLoanForm: UntypedFormGroup;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum Date allowed. */
  maxDate = new Date();
  codes: any;

  changeRepaymentDate = new UntypedFormControl(false);
  introduceGracePeriods = new UntypedFormControl(false);
  extendRepaymentPeriod = new UntypedFormControl(false);
  adjustinterestrates = new UntypedFormControl(false);
  waivePenalties = new UntypedFormControl(false);

  /** Penalties list */
  penalties: any[] = [];
  /** Selected penalty IDs */
  selectedPenalties: number[] = [];
  /** Select all penalties checkbox */
  selectAllPenalties = false;

  /**
   * @param {FormBuilder} formBuilder Form Builder.
   * @param {LoansService} systemService Loan Service.
   * @param {ActivatedRoute} route Activated Route.
   * @param {Router} router Router for navigation.
   * @param {SettingsService} settingsService Settings Service
   */
  constructor() {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit() {
    this.maxDate = this.settingsService.businessDate;
    this.codes = this.dataObject.rescheduleReasons;
    this.setRescheduleLoanForm();
    this.loadPenalties();
    this.setupWaivePenaltiesListener();
  }

  setRescheduleLoanForm() {
    this.rescheduleLoanForm = this.formBuilder.group({
      rescheduleFromDate: [
        new Date(),
        Validators.required
      ],
      rescheduleReasonId: [
        '',
        Validators.required
      ],
      submittedOnDate: [
        new Date(),
        Validators.required
      ],
      rescheduleReasonComment: [''],
      adjustedDueDate: [''],
      graceOnPrincipal: [''],
      graceOnInterest: [''],
      extraTerms: [''],
      newInterestRate: ['']
    });
  }

  submit() {
    const rescheduleLoanFormData = this.rescheduleLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const prevRescheduleFromDate = this.rescheduleLoanForm.value.rescheduleFromDate;
    const prevAdjustedDueDate = this.rescheduleLoanForm.value.adjustedDueDate;
    const prevSubmittedOnDate = this.rescheduleLoanForm.value.submittedOnDate;
    if (prevRescheduleFromDate instanceof Date) {
      rescheduleLoanFormData.rescheduleFromDate = this.dateUtils.formatDate(prevRescheduleFromDate, dateFormat);
    }
    if (prevAdjustedDueDate instanceof Date) {
      rescheduleLoanFormData.adjustedDueDate = this.dateUtils.formatDate(prevAdjustedDueDate, dateFormat);
    }
    if (prevSubmittedOnDate instanceof Date) {
      rescheduleLoanFormData.submittedOnDate = this.dateUtils.formatDate(prevSubmittedOnDate, dateFormat);
    }
    const data = {
      ...rescheduleLoanFormData,
      dateFormat,
      locale
    };
    data.loanId = this.loanId;

    // Waive penalties first if selected, then submit reschedule
    if (this.waivePenalties.value && this.selectedPenalties.length > 0) {
      this.penaltyManagementService.waivePenalties(this.loanId, this.selectedPenalties).subscribe({
        next: () => {
          this.submitReschedule(data);
        },
        error: (error: any) => {
          console.error('Error waiving penalties:', error);
          // Continue with reschedule even if waive fails
          this.submitReschedule(data);
        }
      });
    } else {
      this.submitReschedule(data);
    }
  }

  /** Submit the reschedule after penalties are waived */
  private submitReschedule(data: any) {
    this.loanService.submitRescheduleData(data).subscribe((response: any) => {
      // TODO: needs to be updated
      // mentioned in Community App:
      // location.path('/loans-accounts/' + scope.loanId + '/viewreschedulerequest/'+ data.resourceId);
      this.router.navigate(['../../general'], { relativeTo: this.route });
    });
  }

  /**
   * Load penalties for the loan
   * Penalties are charges calculated for installments in the payment schedule.
   * Each penalty charge has a dueDate that corresponds to an installment due date.
   */
  loadPenalties() {
    this.penaltyManagementService.loadPenalties(this.loanId).subscribe({
      next: (penalties: any[]) => {
        this.penalties = penalties;
      },
      error: (error: any) => {
        console.error('Error loading penalties:', error);
        this.penalties = [];
      }
    });
  }

  /**
   * Setup listener for waive penalties checkbox
   * Following the pattern of using valueChanges.subscribe()
   */
  setupWaivePenaltiesListener() {
    this.waivePenalties.valueChanges.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: boolean) => {
      if (!value) {
        // Reset selections when toggling off
        this.selectedPenalties = [];
        this.selectAllPenalties = false;
      }
    });
  }

  /**
   * Toggle select all penalties
   * Following the toggleSelects() pattern from loans-active-client-members
   */
  toggleSelectAllPenalties() {
    const result = this.penaltyManagementService.toggleSelectAllPenalties(this.selectAllPenalties, this.penalties);
    this.selectAllPenalties = result.selectAllPenalties;
    this.selectedPenalties = result.selectedPenalties;
  }

  /**
   * Toggle individual penalty selection
   * Following the toggleSelect() pattern from loans-active-client-members
   */
  togglePenaltySelection(penaltyId: number) {
    const result = this.penaltyManagementService.togglePenaltySelection(
      penaltyId,
      this.selectedPenalties,
      this.penalties
    );
    this.selectedPenalties = result.selectedPenalties;
    this.selectAllPenalties = result.selectAllPenalties;
  }

  /**
   * Check if penalty is selected
   */
  isPenaltySelected(penaltyId: number): boolean {
    return this.penaltyManagementService.isPenaltySelected(penaltyId, this.selectedPenalties);
  }

  /**
   * Get penalty display key or plain text for translation/output
   * Normalizes common backend values (like MORA / labels.inputs.*) to translation keys
   */
  getPenaltyDisplayKey(penalty: any): string {
    return this.penaltyManagementService.getPenaltyDisplayKey(penalty);
  }
}
