import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { Dates } from 'app/core/utils/dates';
import { LoansService } from 'app/loans/loans.service';
import { LoanStatus } from 'app/loans/models/loan-status.model';
import { SettingsService } from 'app/settings/settings.service';
import { ConfirmationDialogComponent } from 'app/shared/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'mifosx-reschedule-loan-tab',
  templateUrl: './reschedule-loan-tab.component.html',
  styleUrls: ['./reschedule-loan-tab.component.scss']
})
export class RescheduleLoanTabComponent implements OnInit {
  @Input() loanStatus: LoanStatus;

  loanRescheduleData: any;
  loanRescheduleDataColumns: string[] = ['id', 'rescheduleFromDate', 'reason', 'status', 'actions'];
  clientId: any;

  constructor(private route: ActivatedRoute,
    private router: Router,
    private loansServices: LoansService,
    private settingsService: SettingsService,
    private dateUtils: Dates,
    private dialog: MatDialog) {
    this.clientId = this.route.parent.parent.snapshot.paramMap.get('clientId');
    this.route.parent.data.subscribe((data: { loanRescheduleData: any }) => {
      this.loanRescheduleData = data.loanRescheduleData;
    });
  }

  ngOnInit(): void {
  }

  manageRequest(request: any, command: string): void {
    const approveLoanRescheduleDialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: { heading: `${command} Loan Reschedule`, dialogContext: `Are you sure you want ${command} the Loan Reschedule ${request.id}` }
    });
    approveLoanRescheduleDialogRef.afterClosed().subscribe((response: { confirm: any }) => {
      if (response.confirm) {
        const locale = this.settingsService.language.code;
        const dateFormat = this.settingsService.dateFormat;
        const payload = {
          dateFormat,
          locale
        };
        if (command === 'Approve') {
          payload['approvedOnDate'] = this.dateUtils.formatDate(this.settingsService.businessDate, dateFormat);
        } else {
          payload['rejectedOnDate'] = this.dateUtils.formatDate(this.settingsService.businessDate, dateFormat);
        }
        this.loansServices.applyCommandLoanRescheduleRequests(request.id, command.toLowerCase(), payload).subscribe((result: any) => {
          this.reload();
        });
      }
    });
  }

  /**
   * Refetches data fot the component
   */
  private reload() {
    const url: string = this.router.url;
    this.router.navigateByUrl(`/clients/${this.clientId}/loans-accounts`, { skipLocationChange: true })
      .then(() => this.router.navigate([url]));
  }
}
