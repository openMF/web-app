/** Angular Imports */
import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';

import { MatPaginator } from '@angular/material/paginator';
import { MatSort, MatSortHeader } from '@angular/material/sort';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';

/** rxjs Imports */
import { merge } from 'rxjs';
import { tap, startWith, map, distinctUntilChanged, debounceTime } from 'rxjs/operators';

/** Custom Services */
import { GroupsService } from './groups.service';

/** Custom Data Source */
import { GroupsDataSource } from './groups.datasource';
import { MatCard } from '@angular/material/card';
import { MatFormField } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { HasPermissionDirective } from '../directives/has-permission/has-permission.directive';
import {
  MatTable,
  MatColumnDef,
  MatHeaderCellDef,
  MatHeaderCell,
  MatCellDef,
  MatCell,
  MatHeaderRowDef,
  MatHeaderRow,
  MatRowDef,
  MatRow
} from '@angular/material/table';
import { NgClass, AsyncPipe } from '@angular/common';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';
import { StatusLookupPipe } from '../pipes/status-lookup.pipe';

/**
 * Groups component.
 */
@Component({
  selector: 'mifosx-app-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss'],
  imports: [
    MatCard,
    MatFormField,
    MatInput,
    ReactiveFormsModule,
    MatCheckbox,
    MatButton,
    RouterLink,
    FaIconComponent,
    HasPermissionDirective,
    MatTable,
    MatSort,
    MatColumnDef,
    MatHeaderCellDef,
    MatHeaderCell,
    MatSortHeader,
    MatCellDef,
    MatCell,
    NgClass,
    MatHeaderRowDef,
    MatHeaderRow,
    MatRowDef,
    MatRow,
    MatPaginator,
    AsyncPipe,
    TranslatePipe,
    StatusLookupPipe,
    NgxTranslatePipe
  ]
})
export class GroupsComponent implements OnInit, AfterViewInit {
  @ViewChild('showClosedGroups', { static: true }) showClosedGroups: MatCheckbox;

  /** Name form control. */
  name = new UntypedFormControl();
  /** Columns to be displayed in groups table. */
  displayedColumns = [
    'name',
    'accountNo',
    'externalId',
    'status',
    'officeName'
  ];
  /** Data source for groups table. */
  dataSource: GroupsDataSource;
  /** Groups filter. */
  filterGroupsBy = [
    {
      type: 'name',
      value: ''
    }
  ];

  /** Paginator for groups table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for groups table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * @param {GroupsService} groupsService Groups Service
   */
  constructor(private groupsService: GroupsService) {}

  ngOnInit() {
    this.getGroups();
  }

  /**
   * Subscribes to all search filters:
   * Name
   * sort change and page change.
   */
  ngAfterViewInit() {
    this.name.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        tap((filterValue) => {
          this.applyFilter(filterValue, 'name');
        })
      )
      .subscribe();

    this.sort.sortChange.subscribe(() => (this.paginator.pageIndex = 0));

    merge(this.sort.sortChange, this.paginator.page)
      .pipe(tap(() => this.loadGroupsPage()))
      .subscribe();
  }

  changeShowClosedGroups() {
    this.loadGroupsPage();
  }

  /**
   * Loads a page of groups.
   */
  loadGroupsPage() {
    if (!this.sort.direction) {
      delete this.sort.active;
    }
    this.dataSource.getGroups(
      this.filterGroupsBy,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize,
      !this.showClosedGroups.checked
    );
  }

  /**
   * Filters data in groups table based on passed value and poperty.
   * @param {string} filterValue Value to filter data.
   * @param {string} property Property to filter data by.
   */
  applyFilter(filterValue: string, property: string) {
    this.paginator.pageIndex = 0;
    const findIndex = this.filterGroupsBy.findIndex((filter) => filter.type === property);
    this.filterGroupsBy[findIndex].value = filterValue;
    this.loadGroupsPage();
  }

  /**
   * Initializes the data source for groups table and loads the first page.
   */
  getGroups() {
    this.dataSource = new GroupsDataSource(this.groupsService);
    this.dataSource.getGroups(
      this.filterGroupsBy,
      this.sort.active,
      this.sort.direction,
      this.paginator.pageIndex,
      this.paginator.pageSize
    );
  }
}
