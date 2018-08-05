import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-view-rule',
  templateUrl: './view-rule.component.html',
  styleUrls: ['./view-rule.component.scss']
})
export class ViewRuleComponent implements OnInit {

  accountingRule: any;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { accountingRule: any }) => {
      this.accountingRule = data.accountingRule;
    });
  }

  ngOnInit() {
  }

}
