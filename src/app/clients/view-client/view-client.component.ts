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
  public id: number = undefined;
  loanAccounts: any = undefined;
  savingsAccounts: any = undefined;
  shareAccounts: any = undefined;
  upcomingCharges: any = undefined;
  clientInfo: any = undefined;
  paramsSubscription: Subscription;
  post: any = [];
  clientAddress: any = undefined;
  private LOAN_DATA: any = undefined;
  private SAVINGS_DATA: any = undefined;
  private SHARES_DATA: any = undefined;
  displayedLoanColumns = ['account', 'loanAccount', 'originalLoan', 'loanBalance', 'amountPaid', 'type'];
  displayedSavingsColumns = ['account', 'savingsAccount', 'lastActive', 'balance'];
  displayedSharesColumns = ['account', 'shareAccount', 'approvedShares', 'pending'];

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

    this.getClientId(this.id);
    this.getClientAccounts(this.id);
    this.getClientCharges(this.id);
    this.getClientAddress(this.id);
  }

  getClientId(id: any) {
    this.clientService.getClientId(id)
      .subscribe(
        (res => {
          const groupArray = new Array;
          this.clientInfo = res;
          this.clientInfo.dateOfBirth = this.clientInfo.dateOfBirth.reverse().join('-');
          this.clientInfo.activationDate = this.clientInfo.activationDate.reverse().join('-');

          this.clientInfo.groups.forEach(function (item: any) {
            groupArray.push(item.name);
          });
          this.clientInfo.groupNames = groupArray.join('|');

        })
      );
  }

  getClientAccounts(id: any) {
    this.clientService.getClientAccounts(id)
      .subscribe(
        (res => {
          this.loanAccounts = res['loanAccounts'];
          this.savingsAccounts = res['savingsAccounts'];
          this.shareAccounts = res['shareAccounts'];
          this.LOAN_DATA = this.loanAccounts;
          this.SAVINGS_DATA = this.savingsAccounts;
          this.SHARES_DATA = this.shareAccounts;
          this.dataSourceLoan = new MatTableDataSource(this.LOAN_DATA);
          this.dataSourceSavings = new MatTableDataSource(this.SAVINGS_DATA);
          this.dataSourceShares = new MatTableDataSource(this.SHARES_DATA);
        })
      );
  }

  getClientCharges(id: any) {
    this.clientService.getClientCharges(id)
      .subscribe(
        (res => {
          this.upcomingCharges = res['pageItems'];
        })
      );
  }

  getClientAddress(id: any) {
    this.clientService.getClientAddress(this.id)
      .subscribe(
        (res => {
          this.clientAddress = res;
          console.log(res);
        })
      );
  }

  ngOnDestroy() {
    this.paramsSubscription.unsubscribe();
  }
}

