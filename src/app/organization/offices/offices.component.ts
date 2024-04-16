/** Angular Imports */
import { Component, OnInit, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { ActivatedRoute } from "@angular/router";
import { OfficeTreeNode } from "app/shared/office-tree-view/office-tree-node";

/** rxjs Imports */
import { of } from "rxjs";
import { OrganizationService } from "app/organization/organization.service";
import { TableVirtualScrollDataSource } from "ng-table-virtual-scroll";

/**
 * Offices component.
 */
@Component({
  selector: "mifosx-offices",
  templateUrl: "./offices.component.html",
  styleUrls: ["./offices.component.scss"],
})
export class OfficesComponent implements OnInit {
  /** Offices data. */
  officesData: any;
  /** Columns to be displayed in offices table. */
  displayedColumns: string[] = ["name", "officeHierarchyPath", "parentName", "openingDate"];
  /** Data source for offices table. */
  dataSource: TableVirtualScrollDataSource<any>;
  treeDataSource: OfficeTreeNode[] = [];
  toggleText = "Tree View";
  treeView = false;
  /** Paginator for offices table. */
  // @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator
  @ViewChild(MatPaginator, { static: false })
  set paginator(value: MatPaginator) {
    this.dataSource.paginator = value;
  }
  /** Sorter for offices table. */
  // @ViewChild(MatSort, { static: true }) sort: MatSort
  @ViewChild(MatSort, { static: false })
  set sort(value: MatSort) {
    this.dataSource.sort = value;
  }

  /**
   * Retrieves the offices data from `resolve`.
   * @param {ActivatedRoute} route Activated Route.
   */
  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {
    this.route.data.subscribe((data: { offices: any }) => {
      this.officesData = data.offices.filter((x) => x.status === true);
    });
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
  }

  /**
   * Initializes the data source, paginator and sorter for offices table.
   */
  setOffices() {
    this.dataSource = new TableVirtualScrollDataSource(this.officesData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  trackById(index: number, item: any): number {
    return item.id; // unique id corresponding to the item
  }

  flatToHierarchy(flat: any) {
    const roots = []; // offices without parent
    // make them accessible by id on this map
    const all = {};
    flat.forEach(function (item: any) {
      all[item.id] = item;
    });
    // connect childrens to its parent, and split roots apart
    Object.keys(all).forEach(function (id: any) {
      const item = all[id];
      if (!item.parentId || item.parentId === null) {
        const displayName = [item.levelName, item.name]
          .filter((word) => undefined !== word && word.length > 0)
          .join(" - ");
        item.name = displayName;
        roots.push(item);
      } else if (item.parentId in all) {
        const displayName = [item.levelName, item.name]
          .filter((word) => undefined !== word && word.length > 0)
          .join(" - ");
        item.name = displayName;
        const p = all[item.parentId];
        if (!("children" in p)) {
          p.children = [];
        }
        p.children.push(item);
      }
    });
    return roots;
  }

  searchTreeViewOffices() {
    this.organizationService.searchOfficeTreeHierarchy(true, "OAF").subscribe((response) => {
      if (response) {
        const data = response
          .filter((x) => x.status === true)
          .map((item: any) => ({
            name: item.name,
            id: item.id,
            parentId: item.parentId,
            levelName: item.isCountry ? "Country" : item.officeCountryHierarchyLevelName,
          }));
        this.treeDataSource = this.flatToHierarchy(data);
      }
    });
  }

  makeOfficeTreeNode(btntext: string) {
    this.treeView = btntext === "Tree View" ? true : false;
    if (this.treeView) {
      this.toggleText = "List View";
      this.searchTreeViewOffices();
    } else {
      this.toggleText = "Tree View";
    }
  }
}
