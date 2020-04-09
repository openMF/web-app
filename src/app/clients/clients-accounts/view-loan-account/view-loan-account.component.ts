import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'mifosx-view-loan-account',
  templateUrl: './view-loan-account.component.html',
  styleUrls: ['./view-loan-account.component.scss']
})
export class ViewLoanAccountComponent implements OnInit {
  loanId: string;

  constructor() { }

  ngOnInit() {
  }

}
