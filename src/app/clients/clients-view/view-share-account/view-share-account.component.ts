import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-share-account',
  templateUrl: './view-share-account.component.html',
  styleUrls: ['./view-share-account.component.scss']
})
export class ViewShareAccountComponent implements OnInit {
  chargesColumns: string[] = ['Name', 'Fee/Penalty', 'Payment due at', 'Calculation Type', 'Due', 'Paid', 'Waived', 'Outstanding'];
  transactionColumns: string[] = ['Transaction Date', 'Transaction Type',	'Total Shares', 'Purchased/Redeemed Price', 'Charge Amount', 'Amount Received/Returned'];
  dividendColumns: string[] = ['Transaction Date', 'Amount', 'Transaction Reference', 'Status'];
  shareAccount: any;

  constructor(
    private route: ActivatedRoute,
  ) {
    this.route.data.subscribe((data: {shareAccountsData: any}) => {
      this.shareAccount = data.shareAccountsData;
    });
   }

  ngOnInit() {
  }

}
