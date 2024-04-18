/** Angular Imports */
import { Component, OnInit } from "@angular/core";
import { UntypedFormGroup, UntypedFormBuilder, Validators } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";

/** Custom Services */
import { LoansService } from "app/loans/loans.service";
import { SettingsService } from "app/settings/settings.service";
import { Dates } from "app/core/utils/dates";

/**
 * Create Top Up Loan component.
 */
@Component({
  selector: "mifosx-top-up-loan",
  templateUrl: "./top-up-loan.component.html",
  styleUrls: ["./top-up-loan.component.scss"],
})
export class TopUpLoanComponent implements OnInit {
  /** Top Up Loan form. */
  topUpLoanForm: UntypedFormGroup;

  /** loan Id to top-up. */
  loanId: string;

  /** Minimum Date allowed. */
  minDate = new Date(2000, 0, 1);

  /** Maximum Date allowed. */
  maxDate = new Date();

  /** top-up loan options. */
  topUpLoanOptions: {
    id: number;
    name: string;
    shortName: string;
    principal: {
      currencyCode: string;
      currencyDigitsAfterDecimal: number;
      inMultiplesOf: number;
      amount: number;
    };
  }[];

  defaultPrincipal: number;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private dateUtils: Dates,
    private loanService: LoansService,
    private settingsService: SettingsService
  ) {
    this.route.data.subscribe((data: { actionButtonData: any }) => {
      this.topUpLoanOptions = data.actionButtonData.eligibleLoanProductOptions;
    });
    this.loanId = this.route.parent.snapshot.params["loanId"];
  }

  /**
   * Creates the top up Loan form.
   */
  ngOnInit() {
    this.createLoanTopUpForm();
  }

  /**
   * Creates the top up Loan form.
   */
  createLoanTopUpForm() {
    this.topUpLoanForm = this.formBuilder.group({
      loanProductForTopUp: ["", Validators.required],
      topUpAmount: ["", Validators.required],
      note: [""],
      transactionDate: [new Date(), Validators.required],
    });
  }
  onLoanProductChanged() {
    this.defaultPrincipal = this.topUpLoanForm.value.loanProductForTopUp.principal.amount;
    this.topUpLoanForm.controls.topUpAmount.setValue(this.defaultPrincipal);
  }

  submit() {
    const topUpLoanFormData = this.topUpLoanForm.value;
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const transactionDate: Date = this.topUpLoanForm.value.transactionDate;
    if (topUpLoanFormData.transactionDate instanceof Date) {
      topUpLoanFormData.transactionDate = this.dateUtils.formatDate(transactionDate, dateFormat);
    }
    const data = {
      ...topUpLoanFormData,
      dateFormat,
      locale,
    };
    this.loanService.submitTopUpLoanApplication(this.loanId, data, "topUpLoan").subscribe((response: any) => {
      this.router.navigate(["../../general"], { relativeTo: this.route });
    });
  }
}
