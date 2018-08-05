import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { AccountingService } from '../accounting.service';

@Component({
  selector: 'mifosx-accounting-rules',
  templateUrl: './accounting-rules.component.html',
  styleUrls: ['./accounting-rules.component.scss']
})
export class AccountingRulesComponent implements OnInit {

  displayedColumns: string[] = ['name', 'officeName', 'debitTags', 'debitAccount', 'creditTags', 'creditAccount'];
  dataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private accountingService: AccountingService) { }

  ngOnInit() {
    this.getAccountingRules();
  }

  getAccountingRules() {
    this.accountingService.getAccountingRules().subscribe(accountingRules => {
      accountingRules.forEach((accountingRule: any) => {
        accountingRule.debitTags = accountingRule.debitTags ? accountingRule.debitTags.map((debitTag: any) => debitTag.tag.name).join(', ') : '';
        accountingRule.creditTags = accountingRule.creditTags ? accountingRule.creditTags.map((creditTag: any) => creditTag.tag.name).join(', ') : '';
      });
      this.dataSource = new MatTableDataSource(accountingRules);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sortingDataAccessor = (accountingRule: any, property: any) => {
        switch (property) {
          case 'debitAccount': return accountingRule.debitAccounts[0].name;
          case 'creditAccount': return accountingRule.creditAccounts[0].name;
          default: return accountingRule[property];
        }
      };
      this.dataSource.sort = this.sort;
    });
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

}
