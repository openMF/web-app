import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-share-account',
  templateUrl: './view-share-account.component.html',
  styleUrls: ['./view-share-account.component.scss']
})
export class ViewShareAccountComponent implements OnInit {
  // Charges tab Columns Labels
  chargesColumns: string[] = ['Name', 'Fee/Penalty', 'Payment due at', 'Calculation Type', 'Due', 'Paid', 'Waived', 'Outstanding'];
  // Transaction Overview tab Column Labels
  transactionColumns: string[] = ['Transaction Date', 'Transaction Type',	'Total Shares', 'Purchased/Redeemed Price', 'Charge Amount', 'Amount Received/Returned'];
  // Dividend Tab Column Labels
  dividendColumns: string[] = ['Transaction Date', 'Amount', 'Transaction Reference', 'Status'];
  // Client share-account data variable
  shareAccount: any;

  constructor(
    private route: ActivatedRoute,
  ) {}

  ngOnInit() {
    this.route.data.subscribe((data: {shareAccountsData: any, }) => {
      this.shareAccount = data.shareAccountsData;
    });
  }

}
