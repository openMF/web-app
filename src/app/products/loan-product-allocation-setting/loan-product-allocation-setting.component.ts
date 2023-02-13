import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'mifosx-loan-product-allocation-setting',
  templateUrl: './loan-product-allocation-setting.component.html',
  styleUrls: ['./loan-product-allocation-setting.component.scss'],
})
export class LoanProductAllocationSettingComponent implements OnInit {
  loanProductAllocationData: any;
  displayedColumns: string[] = ['name', 'ou', 'repaymentChoice', 'actions'];
  dataSource: MatTableDataSource<any>;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  constructor(private route: ActivatedRoute) {
    this.route.data.subscribe((data: { loanProductAllocationData: any }) => {
      this.loanProductAllocationData = [];
      data.loanProductAllocationData.content.forEach(element => {
        this.loanProductAllocationData.push({
          id: element.id,
          name: element.officeCountry.name,
          ou: element.districtOffice.name,
          repaymentChoice: element.loanPaymentAllocationSetting.repaymentChoice
        });
      });
    });
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.loanProductAllocationData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
