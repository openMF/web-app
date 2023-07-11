import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'mifosx-investors',
  templateUrl: './investors.component.html',
  styleUrls: ['./investors.component.scss']
})
export class InvestorsComponent implements OnInit {

  /** Minimum transaction date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum transaction date allowed. */
  maxDate = new Date();

  transferDateFrom = new FormControl('');
  transferDateTo = new FormControl('');
  transferExternalId = new FormControl('');

  /** Entry type filter form control. */
  entryTypeFilter = new FormControl('');
  /** Entry type filter data. */
  entryTypeFilterData = [
    {
      option: 'All',
      value: ''
    },
    {
      option: 'Sale',
      value: true
    },
    {
      option: 'Buyed Back',
      value: false
    }
  ];

  /** Columns to be displayed in investors table. */
  displayedColumns: string[] = ['investor', 'loanAccount', 'totalAmount', 'principal', 'interest', 'fees', 'penalties', 'actions'];
  /** Data source for investors table. */
  dataSource: MatTableDataSource<any> = new MatTableDataSource();

  constructor() { }

  ngOnInit(): void {
  }

}
