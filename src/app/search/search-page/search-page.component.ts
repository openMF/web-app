/** Angular Imports */
import { Component } from '@angular/core';
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

  /** Search Results */
  searchResults: any;
  /** Flags if number of search results exceed 200 */
  overload: boolean;

  /**
   * @param {ActivatedRoute} route Activated Route
   * @param {Router} router Router
   */
  constructor(private route: ActivatedRoute,
              private router: Router) {
    this.route.data.subscribe(( data: { searchResults: any }) => {
      this.searchResults = data.searchResults;
      this.overload = this.searchResults.length > 200 ? true : false;
      if (this.overload) {
        this.searchResults = this.searchResults.slice(0, 200);
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
        this.router.navigate(['clients', entity.entityId]);
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
        this.router.navigate(['clients', entity.parentId, 'savings-accounts', entity.entityId]);
        break;
      case 'LOAN':
        this.router.navigate(['clients', entity.parentId, 'loans', entity.entityId]);
        break;
    }
  }

}
