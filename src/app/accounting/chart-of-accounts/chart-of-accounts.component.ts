/** Angular Imports */
import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { NestedTreeControl } from '@angular/cdk/tree';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Models */
import { GLAccountNode } from './gl-account-node.model';

/** Custom Services */
import { GlAccountTreeService } from './gl-account-tree.service';

/**
 * Chart of accounts component.
 */
@Component({
  selector: 'mifosx-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.scss']
})
export class ChartOfAccountsComponent implements AfterViewInit, OnInit {

  /** Button toggle group form control for type of view. (list/tree) */
  viewGroup = new FormControl('listView');
  /** GL Account data. */
  glAccountData: any;
  /** Columns to be displayed in chart of accounts table. */
  displayedColumns: string[] = ['name', 'glCode', 'glAccountType', 'disabled', 'manualEntriesAllowed', 'usedAs'];
  /** Data source for chart of accounts table. */
  tableDataSource: MatTableDataSource<any>;
  /** Nested tree control for chart of accounts tree. */
  nestedTreeControl: NestedTreeControl<GLAccountNode>;
  /** Nested tree data source for chart of accounts tree. */
  nestedTreeDataSource: MatTreeNestedDataSource<GLAccountNode>;
  /** Selected GL Account. */
  glAccount: GLAccountNode;

  /** Paginator for chart of accounts table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for chart of accounts table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the gl accounts data from `resolve` and initializes(generates) gl accounts tree.
   * @param {GlAccountTreeService} glAccountTreeService GL Account tree service.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private glAccountTreeService: GlAccountTreeService,
              private route: ActivatedRoute) {
    this.route.data.subscribe((data: { chartOfAccounts: any }) => {
      this.glAccountData = data.chartOfAccounts;
      glAccountTreeService.initialize(this.glAccountData);
    });
    this.nestedTreeControl = new NestedTreeControl<GLAccountNode>(this._getChildren);
    this.nestedTreeDataSource = new MatTreeNestedDataSource<GLAccountNode>();
  }

  /**
   * Initializes the data source for chart of accounts table and tree.
   */
  ngOnInit() {
    this.tableDataSource = new MatTableDataSource(this.glAccountData);
    this.glAccountTreeService.treeDataChange.subscribe((glAccountTreeData: GLAccountNode[]) => {
      this.nestedTreeDataSource.data = glAccountTreeData;
      this.nestedTreeControl.expand(this.nestedTreeDataSource.data[0]);
      this.nestedTreeControl.dataNodes = glAccountTreeData;
    });
  }

  /**
   * Initializes the paginator and sorter for chart of accounts table.
   */
  ngAfterViewInit() {
    this.tableDataSource.paginator = this.paginator;
    this.tableDataSource.sortingDataAccessor = (glAccount: any, property: any) => {
      switch (property) {
        case 'glAccountType': return glAccount.type.value;
        case 'usedAs': return glAccount.usage.value;
        default: return glAccount[property];
      }
    };
    this.tableDataSource.sort = this.sort;
  }

  /**
   * Filters data in chart of accounts table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * View selected gl account.
   * @param {GLAccountNode} glAccount GL Account to be viewed.
   */
  viewGLAccountNode(glAccount: GLAccountNode) {
    if (glAccount.glCode) {
      this.glAccount = glAccount;
    } else {
      delete this.glAccount;
    }
  }

  /**
   * Checks if selected node in tree has children.
   */
  hasNestedChild = (_: number, node: GLAccountNode) => node.children.length;

  /**
   * Gets the children of selected node in tree.
   */
  private _getChildren = (node: GLAccountNode) => of(node.children);

}
