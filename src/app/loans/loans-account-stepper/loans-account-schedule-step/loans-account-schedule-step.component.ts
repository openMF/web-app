import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-loans-account-schedule-step',
  templateUrl: './loans-account-schedule-step.component.html',
  styleUrls: ['./loans-account-schedule-step.component.scss']
})
export class LoansAccountScheduleStepComponent implements OnInit {

  /** Currency Code */
  @Input() currencyCode: string;
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Data */
  @Input() loansAccount: any;

  showRepayment = false;
  repaymentScheduleDetails: any = {periods: []};

  loanId: any = null;

  constructor(private loansService: LoansService,
    private settingsService: SettingsService,
    private route: ActivatedRoute) {
      this.loanId = this.route.snapshot.params['loanId'];
  }

  ngOnInit(): void { }

  showRepaymentInfo(): void {
    this.repaymentScheduleDetails = {periods: []};
    this.showRepayment = !this.showRepayment;
    if (this.showRepayment) {
      const locale = this.settingsService.language.code;
      const dateFormat = this.settingsService.dateFormat;
      const payload = this.loansService.buildLoanRequestPayload(this.loansAccount, this.loansAccountTemplate,
        this.loansAccountProductTemplate.calendarOptions, locale, dateFormat);

      this.loansService.calculateLoanSchedule(payload).subscribe((response: any) => {
        this.repaymentScheduleDetails = response;
      });
    }
  }
}
