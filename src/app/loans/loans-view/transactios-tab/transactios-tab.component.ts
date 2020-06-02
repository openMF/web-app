import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {FormControl} from '@angular/forms';

@Component({
  selector: 'mifosx-transactios-tab',
  templateUrl: './transactios-tab.component.html',
  styleUrls: ['./transactios-tab.component.scss']
})
export class TransactiosTabComponent implements OnInit {

  /** Loan Details Data */
  transactions: any;
  showTransactions: any;
  tempTransaction: any;
  /** Columns to be displayed in original schedule table. */
  displayedColumns: string[] = ['id', 'office', 'transactionDate', 'transactionType', 'amount', 'principal', 'interest', 'fee', 'penalties', 'loanBalance', 'actions'];
  hideAccrualsParam: FormControl;

  /**
   * Retrieves the loans with associations data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe(( data: { loanDetailsAssociationData: any }) => {
      this.transactions = data.loanDetailsAssociationData.transactions;
      this.tempTransaction = data.loanDetailsAssociationData.transactions;
    });
  }

  ngOnInit() {
    this.hideAccrualsParam = new FormControl(false);
    this.tempTransaction.forEach((element: any) => {
      if (element.type.accrual) {
        this.tempTransaction = this.removeItem(this.tempTransaction, element);
      }
    });
    this.showTransactions = this.transactions;
  }

  hideAccruals()  {
    if (!this.hideAccrualsParam.value) {
      this.showTransactions = this.tempTransaction;
    } else {
      this.showTransactions = this.transactions;
    }
  }

  removeItem(arr: any, item: any) {
    console.log('item: ', item);
    return arr.filter((f: any) => f !== item);
   }

}
