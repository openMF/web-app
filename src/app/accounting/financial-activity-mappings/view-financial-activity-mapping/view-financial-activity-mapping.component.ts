import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AccountingService } from '../../accounting.service';

@Component({
  selector: 'mifosx-view-financial-activity-mapping',
  templateUrl: './view-financial-activity-mapping.component.html',
  styleUrls: ['./view-financial-activity-mapping.component.scss']
})
export class ViewFinancialActivityMappingComponent implements OnInit {

  financialActivityAccountId: any;
  financialActivityAccountData: any;

  constructor(private route: ActivatedRoute,
              private accountingService: AccountingService) { }

  ngOnInit() {
    this.financialActivityAccountId = this.route.snapshot.paramMap.get('id');
    this.getFinancialActivityAccount();
  }

  getFinancialActivityAccount() {
    this.accountingService.getFinancialActivityAccount(this.financialActivityAccountId)
      .subscribe((financialActivityAccountData: any) => {
        this.financialActivityAccountData = financialActivityAccountData;
        console.log(financialActivityAccountData);
      });
  }

}
