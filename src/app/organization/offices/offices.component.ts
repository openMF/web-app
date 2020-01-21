/** Angular Imports */
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatTreeNestedDataSource } from '@angular/material/tree';
import { ActivatedRoute } from '@angular/router';
import { NestedTreeControl } from '@angular/cdk/tree';
import { FormControl } from '@angular/forms';

/** rxjs Imports */
import { of } from 'rxjs';

/** Custom Models */
import { OfficeNode } from './office-node.model';

/** Custom Services */
import { OfficeTreeService } from './office-tree.service';

/**
 * Offices component.
 */
@Component({
  selector: 'mifosx-offices',
  templateUrl: './offices.component.html',
  styleUrls: ['./offices.component.scss']
})
export class OfficesComponent implements OnInit {

  /** Button toggle group form control for type of view. (list/tree) */
  viewGroup = new FormControl('listView');
  /** Offices data. */
  officesData: any;
  /** Columns to be displayed in offices table. */
  displayedColumns: string[] = ['name', 'externalId', 'parentName', 'openingDate'];
  /** Data source for offices table. */
  dataSource: MatTableDataSource<any>;
  /** Nested tree control for offices tree. */
  nestedTreeControl: NestedTreeControl<OfficeNode>;
  /** Nested tree data source for offices tree. */
  nestedTreeDataSource: MatTreeNestedDataSource<OfficeNode>;
  /** Selected Office. */
  office: OfficeNode;
  /** Office data tables. */
  dataTablesData: any;

  /** Paginator for offices table. */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  /** Sorter for offices table. */
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  /**
   * Retrieves the offices data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   * @param {OfficeTreeService} officeTreeService Office Tree Service.
   */
  constructor(private route: ActivatedRoute,
              private officeTreeService: OfficeTreeService) {
    this.route.data.subscribe(( data: { offices: any, officeDataTables: any }) => {
      this.officesData = data.offices;
      officeTreeService.initialize(this.officesData);
      this.dataTablesData = data.officeDataTables;
    });
    this.nestedTreeControl = new NestedTreeControl<OfficeNode>(this._getChildren);
    this.nestedTreeDataSource = new MatTreeNestedDataSource<OfficeNode>();
  }

  /**
   * Filters data in offices table based on passed value.
   * @param {string} filterValue Value to filter data.
   */
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  /**
   * Sets the offices table.
   */
  ngOnInit() {
    this.setOffices();
    this.officeTreeService.treeDataChange.subscribe((officeTreeData: OfficeNode[]) => {
      this.nestedTreeDataSource.data = officeTreeData;
      this.nestedTreeControl.expand(this.nestedTreeDataSource.data[0]);
      this.nestedTreeControl.dataNodes = officeTreeData;
    });
  }

  /**
   * Initializes the data source, paginator and sorter for offices table.
   */
  setOffices() {
    this.dataSource = new MatTableDataSource(this.officesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * View selected office.
   * @param {OfficeNode} office Office to be viewed.
   */
  viewOfficeNode(office: OfficeNode) {
    if (office.id) {
      this.office = office;
    } else {
      delete this.office;
    }
  }

  /**
   * Closes the current view for office
   */
  closeOffice() {
    delete this.office;
  }

  /**
   * Checks if selected node in tree has children.
   */
  hasNestedChild = (_: number, node: OfficeNode) => node.children.length;

  /**
   * Gets the children of selected node in tree.
   */
  private _getChildren = (node: OfficeNode) => of(node.children);

}
