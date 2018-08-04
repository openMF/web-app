import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource } from '@angular/material';
import { FormControl } from '@angular/forms';
import { startWith, map, tap } from 'rxjs/operators';

import { AccountingService } from '../accounting.service';

@Component({
  selector: 'mifosx-closing-entries',
  templateUrl: './closing-entries.component.html',
  styleUrls: ['./closing-entries.component.scss']
})
export class ClosingEntriesComponent implements OnInit {

  displayedColumns: string[] = ['officeName', 'closingDate', 'comments', 'createdByUsername'];
  dataSource: any;

  officeName = new FormControl();
  officeData: any;
  filteredOfficeData: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private accountingService: AccountingService) { }

  ngOnInit() {
    this.getOffices();
    this.applyFilter();
    this.getAccountingClosures();
  }

  applyFilter() {
    this.officeName.valueChanges.subscribe((filterValue: string) => {
      this.dataSource.filter = filterValue.trim().toLowerCase();
    });
  }

  getAccountingClosures() {
    this.accountingService.getAccountingClosures().subscribe((glAccountClosureData: any) => {
      this.dataSource = new MatTableDataSource(glAccountClosureData);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
    });
  }

  getOffices() {
    this.accountingService.getOffices().subscribe(officeData => {
      this.officeData = officeData;
      this.filteredOfficeData = this.officeName.valueChanges
      .pipe(
        startWith(''),
        map((office: any) => typeof office === 'string' ? office : office.name),
        map((officeName: string) => officeName ? this.filterOfficeAutocompleteData(this.officeData, officeName) : this.officeData)
      );
    });
  }

  private filterOfficeAutocompleteData(officeData: any, officeName: string): any {
    return officeData.filter((office: any) => office.name.toLowerCase().includes(officeName.toLowerCase()));
  }

}
