import { ClientsService } from 'app/clients/clients.service';
import { Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import { DataSource } from '@angular/cdk/collections';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';

@Component({
  selector: 'mifosx-view-client',
  templateUrl: './view-client.component.html',
  styleUrls: ['./view-client.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ViewClientComponent implements OnInit, OnDestroy {
  id: number = undefined;
  loanAccounts: any = undefined;
  savingsAccounts: any = undefined;
  shareAccounts: any = undefined;
  upcomingCharges: any = undefined;
  clientInfo: any = undefined;
  paramsSubscription: Subscription;
  post: any = [];
  private LOAN_DATA: any = undefined;
  private SAVINGS_DATA: any = undefined;
  private SHARES_DATA: any = undefined;
  displayedLoanColumns =  ['account', 'loanAccount', 'originalLoan', 'loanBalance', 'amountPaid', 'type'];
  displayedSavingsColumns =  ['account', 'savingsAccount', 'lastActive', 'balance'];
  displayedSharesColumns =  ['account', 'shareAccount', 'approvedShares', 'pending'];

  dataSourceLoan = new MatTableDataSource();
  dataSourceSavings = new MatTableDataSource();
  dataSourceShares = new MatTableDataSource();


  constructor(private route: ActivatedRoute, private clientService: ClientsService) {}

  ngOnInit() {
    this.paramsSubscription = this.route.params
    .subscribe(
      (params: Params) => {
        this.id = params['id'];
      }
    );
    this.clientService.getClientId(this.id)
      .subscribe(
        (res => {
          const groupArray = new Array;
          this.clientInfo = res;
          this.clientInfo.dateOfBirth = this.clientInfo.dateOfBirth.reverse().join('-');
          this.clientInfo.activationDate = this.clientInfo.activationDate.reverse().join('-');

          this.clientInfo.groups.forEach(function (item: any) {
            groupArray.push(item.name);
            console.log(item.name);
        });
          this.clientInfo.groupNames = groupArray.join('|');

       console.log( this.clientInfo.groupNames);
  //     console.log(res['dateOfBirth'][1]);
        })
      );
    this.clientService.getClientAccounts(this.id)
    .subscribe(
      (res => {
      this.loanAccounts = res['loanAccounts'];
      this.savingsAccounts = res['savingsAccounts'];
      this.shareAccounts = res['shareAccounts'];
     // this.savingsAccounts.lastActiveTransactionDate = this.savingsAccounts
      //                                                 .lastActiveTransactionDate.reverse().join('-');
      console.log(this.savingsAccounts.lastActiveTransactionDate);
      this.LOAN_DATA  = this.loanAccounts;
      this.SAVINGS_DATA = this.savingsAccounts;
      this.SHARES_DATA = this.shareAccounts;
      this.dataSourceLoan = new MatTableDataSource(this.LOAN_DATA);
      this.dataSourceSavings = new MatTableDataSource(this.SAVINGS_DATA);
      this.dataSourceShares =  new MatTableDataSource(this.SHARES_DATA);

    /*
      console.log(res);
      console.log(this.loanAccounts);
      console.log(this.savingsAccounts);
      console.log(this.shareAccounts); */
      })
    );
    this.clientService.getClientCharges(this.id)
    .subscribe(
      (res => {
      this.upcomingCharges = res['pageItems'];
    //  console.log(this.upcomingCharges);
      })
    );
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }
}
