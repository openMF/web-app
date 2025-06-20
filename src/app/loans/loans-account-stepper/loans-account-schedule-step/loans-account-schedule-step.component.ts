import { Component, Input } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LoansService } from 'app/loans/loans.service';
import { SettingsService } from 'app/settings/settings.service';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { RepaymentScheduleTabComponent } from '../../loans-view/repayment-schedule-tab/repayment-schedule-tab.component';
import { MatStepperPrevious, MatStepperNext } from '@angular/material/stepper';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-loans-account-schedule-step',
  templateUrl: './loans-account-schedule-step.component.html',
  styleUrls: ['./loans-account-schedule-step.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    RepaymentScheduleTabComponent,
    MatStepperPrevious,
    MatStepperNext
  ]
})
export class LoansAccountScheduleStepComponent {
  /** Currency Code */
  @Input() currencyCode: string;
  /** Loans Account Template */
  @Input() loansAccountTemplate: any;
  /** Loans Account Product Template */
  @Input() loansAccountProductTemplate: any;
  /** Loans Account Data */
  @Input() loansAccount: any;

  repaymentScheduleDetails: any = { periods: [] };

  loanId: any = null;

  constructor(
    private loansService: LoansService,
    private settingsService: SettingsService,
    private route: ActivatedRoute
  ) {
    this.loanId = this.route.snapshot.params['loanId'];
  }

  showRepaymentInfo(): void {
    this.repaymentScheduleDetails = { periods: [] };
    const locale = this.settingsService.language.code;
    const dateFormat = this.settingsService.dateFormat;
    const payload = this.loansService.buildLoanRequestPayload(
      this.loansAccount,
      this.loansAccountTemplate,
      this.loansAccountProductTemplate.calendarOptions,
      locale,
      dateFormat
    );
    delete payload['enableInstallmentLevelDelinquency'];
    delete payload['externalId'];

    this.loansService.calculateLoanSchedule(payload).subscribe((response: any) => {
      this.repaymentScheduleDetails = response;
    });
  }
}
