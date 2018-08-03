import { Component, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { MatPaginator, MatSort, MatTableDataSource, MatTreeNestedDataSource } from '@angular/material';
import { NestedTreeControl } from '@angular/cdk/tree';
import { FormControl } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { of } from 'rxjs';

import { GLAccountNode } from './gl-account-node.model';
import { GlAccountTreeService } from './gl-account-tree.service';

@Component({
  selector: 'mifosx-chart-of-accounts',
  templateUrl: './chart-of-accounts.component.html',
  styleUrls: ['./chart-of-accounts.component.scss']
})
export class ChartOfAccountsComponent implements AfterViewInit, OnInit {

  viewGroup = new FormControl('listView');
  glAccountData: any;

  displayedColumns: string[] = ['name', 'glCode', 'glAccountType', 'disabled', 'manualEntriesAllowed', 'usedAs'];
  tableDataSource: any;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  nestedTreeControl: NestedTreeControl<GLAccountNode>;
  nestedTreeDataSource: MatTreeNestedDataSource<GLAccountNode>;
  glAccount: GLAccountNode;

  constructor(private glAccountTreeService: GlAccountTreeService,
              private route: ActivatedRoute) {
    this.route.data.subscribe((data: { glAccountData: any }) => {
      this.glAccountData = data.glAccountData;
      glAccountTreeService.initialize(this.glAccountData);
    });
    this.nestedTreeControl = new NestedTreeControl<GLAccountNode>(this._getChildren);
    this.nestedTreeDataSource = new MatTreeNestedDataSource();
  }

  ngOnInit() {
    this.tableDataSource = new MatTableDataSource(this.glAccountData);
    this.glAccountTreeService.treeDataChange.subscribe((glAccountTreeData: any) => {
      this.nestedTreeDataSource.data = glAccountTreeData;
      this.nestedTreeControl.expand(this.nestedTreeDataSource.data[0]);
    });
  }

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

  applyFilter(filterValue: string) {
    this.tableDataSource.filter = filterValue.trim().toLowerCase();
  }

  hasNestedChild = (_: number, node: GLAccountNode) => node.children.length;

  viewGLAccountNode(glAccount: GLAccountNode) {
    if (glAccount.glCode) {
      this.glAccount = glAccount;
    } else {
      delete this.glAccount;
    }
  }

  private _getChildren = (node: GLAccountNode) => of(node.children);

}
