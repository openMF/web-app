import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DelinquentData, InstallmentLevelDelinquency } from 'app/loans/models/loan-account.model';
import { Currency } from 'app/shared/models/general.model';

@Component({
  selector: 'mifosx-loan-delinquency-tags-tab',
  templateUrl: './loan-delinquency-tags-tab.component.html',
  styleUrls: ['./loan-delinquency-tags-tab.component.scss']
})
export class LoanDelinquencyTagsTabComponent implements OnInit {

  loanDelinquencyTags: any;
  currency: Currency;
  installmentLevelDelinquency: InstallmentLevelDelinquency[] = [];
  loanDelinquencyTagsColumns: string[] = ['classification', 'addedOn', 'liftedOn'];
  installmentDelinquencyTagsColumns: string[] = ['classification', 'minimumAgeDays', 'amount'];

  constructor(private route: ActivatedRoute) {
    this.route.parent.data.subscribe((data: { loanDelinquencyTagsData: any, loanDelinquencyData: any }) => {
      this.loanDelinquencyTags = data.loanDelinquencyTagsData;
      const loanDelinquencyData: DelinquentData | null  = data.loanDelinquencyData.delinquent || null;
      this.currency = data.loanDelinquencyData.currency;
      this.installmentLevelDelinquency = [];
      if (loanDelinquencyData != null) {
        this.installmentLevelDelinquency = loanDelinquencyData.installmentLevelDelinquency || [];
      }
    });
  }

  ngOnInit(): void {
  }

}
