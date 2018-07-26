import { Component, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource, MatPaginator, MatSort } from '@angular/material';

import { AccountingService } from '../accounting.service';

@Component({
  selector: 'mifosx-financial-activity-mappings',
  templateUrl: './financial-activity-mappings.component.html',
  styleUrls: ['./financial-activity-mappings.component.scss']
})
export class FinancialActivityMappingsComponent implements OnInit {

  displayedColumns: string[] = ['financialActivity', 'glAccountName', 'glAccountCode'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private accountingService: AccountingService) { }

  ngOnInit() {
    this.getFinancialActivityAccounts();
  }

  getFinancialActivityAccounts() {
    this.accountingService.getFinancialActivityAccounts().subscribe((financialActivityAccounts: any) => {
      this.dataSource = new MatTableDataSource(financialActivityAccounts);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor = (financialActivityAccount: any, property: any) => {
        switch (property) {
          case 'financialActivity': return financialActivityAccount.financialActivityData.name;
          case 'glAccountName': return financialActivityAccount.glAccountData.name;
          case 'glAccountCode': return financialActivityAccount.glAccountData.glCode;
          default: return financialActivityAccount[property];
        }
      };
      this.dataSource.sort = this.sort;
      console.log(financialActivityAccounts);
    });
  }

}
