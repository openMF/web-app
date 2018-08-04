import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-view-closure',
  templateUrl: './view-closure.component.html',
  styleUrls: ['./view-closure.component.scss']
})
export class ViewClosureComponent implements OnInit {

  accountingClosureId: number;
  accountingClosure: any;

  constructor(private accountingService: AccountingService,
              private route: ActivatedRoute) { }

  ngOnInit() {
    this.accountingClosureId = Number(this.route.snapshot.paramMap.get('id'));
    this.getAccountingClosure();
  }

  getAccountingClosure() {
    this.accountingService.getAccountingClosure(this.accountingClosureId)
      .subscribe((accountingClosure: any) => {
        this.accountingClosure = accountingClosure;
      });
  }

}
