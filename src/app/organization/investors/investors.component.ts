import { animate, state, style, transition, trigger } from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Dates } from 'app/core/utils/dates';
import { ExternalAssetOwner } from 'app/loans/services/external-asset-owner';
import { ExternalAssetOwnerService } from 'app/loans/services/external-asset-owner.service';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-investors',
  templateUrl: './investors.component.html',
  styleUrls: ['./investors.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({height: '0px', minHeight: '0'})),
      state('expanded', style({height: '*'})),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class InvestorsComponent implements OnInit {

  /** Minimum transaction date allowed. */
  minDate = new Date(2000, 0, 1);
  /** Maximum transaction date allowed. */
  maxDate = new Date();

  searchResults: any[] = [];
  searchText = new UntypedFormControl('');
  effectiveFromDate = new UntypedFormControl('');
  effectiveToDate = new UntypedFormControl('');
  settlementFromDate = new UntypedFormControl('');
  settlementToDate = new UntypedFormControl('');

  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  existsDataToFilter = false;
  expandedRowId: number | null;

  totalRows: number;
  isLoading = false;

  pageSize = 50;
  currentPage = 0;
  filterText = '';

  sortAttribute = '';
  sortDirection = '';

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  /** Entry type filter form control. */
  entryTypeFilter = new UntypedFormControl('');
  /** Entry type filter data. */
  entryTypeFilterData = [
    {
      option: 'All',
      value: ''
    },
    {
      option: 'Sell',
      value: true
    },
    {
      option: 'Buyed Back',
      value: false
    }
  ];

  /** Columns to be displayed in investors table. */
  displayedColumns: string[] = ['status', 'effectiveFrom', 'ownerExternalId', 'loanAccount', 'transferExternalId', 'settlementDate', 'purchasePriceRatio', 'totalAmount', 'actions'];
  constructor(private settingsService: SettingsService,
    private externalAssetOwner: ExternalAssetOwner,
    private externalAssetOwnerService: ExternalAssetOwnerService,
    private dateUtils: Dates) { }

  ngOnInit(): void {
    this.maxDate = this.settingsService.maxAllowedDate;
    this.searchEAO();
  }

  itemStatus(status: string): string {
    return this.externalAssetOwner.itemStatus(status);
  }

  isPending(item: any): boolean {
    return this.externalAssetOwner.isPending(item);
  }

  isPendingOrCanceled(item: any): boolean {
    return this.externalAssetOwner.isPendingOrCanceled(item);
  }

  isBuyBackPending(item: any): boolean {
    return this.externalAssetOwner.isBuyBackPending(item);
  }

  canBeCancelled(item: any): boolean {
    return this.externalAssetOwner.validateStatus(item, 'PENDING');
  }

  canBeSold(item: any): boolean {
    return this.externalAssetOwner.canBeSold(item);
  }

  canBeBuyed(item: any): boolean {
    return this.externalAssetOwner.validateStatus(item, 'ACTIVE');
  }

  searchEAO(): void {
    this.isLoading = true;
    const payload: any = {
      'request': {},
      'page': this.currentPage,
      'size': this.pageSize
    };
    const dateFormat = 'yyyy-MM-dd';
    const request: any = {};
    if (this.searchText.value) {
      request['text'] = this.searchText.value;
    }
    if (this.effectiveFromDate.value) {
      request['effectiveFromDate'] = this.dateUtils.formatDate(this.effectiveFromDate.value, dateFormat);
    }
    if (this.effectiveToDate.value) {
      request['effectiveToDate'] = this.dateUtils.formatDate(this.effectiveToDate.value, dateFormat);
    }
    if (this.settlementFromDate.value) {
      request['settlementFromDate'] = this.dateUtils.formatDate(this.settlementFromDate.value, dateFormat);
    }
    if (this.settlementToDate.value) {
      request['settlementToDate'] = this.dateUtils.formatDate(this.settlementToDate.value, dateFormat);
    }
    payload['request'] = request;
    this.externalAssetOwnerService.searchExternalAssetOwnerTransfer(payload).subscribe((response: any) => {
      this.totalRows = response.totalElements;
      this.existsDataToFilter = (response.totalElements > 0);
      this.dataSource.data = response.content;
      this.searchResults = response.content;
      this.isLoading = false;
    });

  }

  transform(data: any): any {
    return data;
  }

  pageChanged(event: PageEvent) {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.searchEAO();
  }

  private resetPaginator() {
    this.currentPage = 0;
    this.paginator.firstPage();
  }
}
