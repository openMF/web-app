/** Angular Imports */
import { Component, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Router, ActivatedRoute } from '@angular/router';

/**
 * Search Page Component
 */
@Component({
  selector: 'mifosx-search-page',
  templateUrl: './search-page.component.html',
  styleUrls: ['./search-page.component.scss']
})
export class SearchPageComponent {
  /** Flags if number of search results exceed 200 */
  overload: boolean;
  /** Datasource for loans disbursal table */
  dataSource: MatTableDataSource<any>;
  /** Displayed Columns for serach results */
  displayedColumns: string[] = ['entityType', 'entityName', 'entityAccount', 'externalId', 'parentType', 'parentName', 'details'];
  /** Paginator for the table */
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  hasResults = false;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe(( data: { searchResults: any }) => {
      this.dataSource = new MatTableDataSource(data.searchResults);
      this.dataSource.paginator = this.paginator;
      this.hasResults = (data.searchResults.length > 0);
      this.overload = data.searchResults.length > 200 ? true : false;
      if (this.overload) {
        this.dataSource = new MatTableDataSource(data.searchResults.slice(0, 200));
      }
    });
  }

  /**
   * Returns link to entity view page.
   * @param {any} entity Entity
   */
  navigate(entity: any) {
    switch (entity.entityType) {
      case 'CLIENT':
        this.router.navigate(['clients', entity.entityId, 'general']);
        break;
      case 'CENTER':
        this.router.navigate(['centers', entity.entityId]);
        break;
      case 'GROUP':
        this.router.navigate(['groups', entity.entityId]);
        break;
      case 'SHARE':
        this.router.navigate(['clients', entity.parentId, 'shares-accounts', entity.entityId]);
        break;
      case 'SAVING':
        this.router.navigate(['clients', entity.parentId, 'savings-accounts', entity.entityId, 'transactions']);
        break;
      case 'LOAN':
        this.router.navigate(['clients', entity.parentId, 'loans-accounts', entity.entityId, 'general']);
        break;
    }
  }

}
