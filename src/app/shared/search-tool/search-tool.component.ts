/** Angular Imports */
import { Component } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { FormControl } from '@angular/forms';

/**
 * Search Tool Component
 */
@Component({
  selector: 'mifosx-search-tool',
  templateUrl: './search-tool.component.html',
  styleUrls: ['./search-tool.component.scss'],
  animations: [
    trigger('fadeInOut', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate(500, style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate(500, style({ opacity: 0 }))
      ])
    ])
  ]
})
export class SearchToolComponent {

  /** Query Form Control */
  query = new FormControl('');
  /** Resource Form Control */
  resource = new FormControl('');

  /** Sets the initial visibility of search input as hidden. Visible if true. */
  searchVisible = false;
  /** Resource Options */
  resourceOptions: any[] = [
    {
      name: 'label.search.scope.all',
      value: 'clients,clientIdentifiers,groups,savings,shares,loans'
    },
    {
      name: 'label.search.scope.clients.and.clientIdentifiers',
      value: 'clients,clientIdentifiers'
    },
    {
      name: 'label.search.scope.groups.and.centers',
      value: 'groups'
    },
    {
      name: 'label.search.scope.savings',
      value: 'savings'
    },
    {
      name: 'label.search.scope.shares',
      value: 'shares'
    },
    {
      name: 'label.input.adhoc.search.loans',
      value: 'loans'
    },
  ];

  /**
   * @param {Router} router Router
   */
  constructor(private router: Router) {
    this.resource.patchValue('clients,clientIdentifiers,groups,savings,shares,loans');
  }

  /**
   * Toggles the visibility of search input with fadeInOut animation.
   */
  toggleSearchVisibility() {
    this.searchVisible = !this.searchVisible;
  }

  /**
   * Searches server for query and resource.
   */
  search() {
    const queryParams: any = {
      query: this.query.value,
      resource: this.resource.value
    };
    this.router.navigate(['/search'], { queryParams: queryParams });
  }

}
