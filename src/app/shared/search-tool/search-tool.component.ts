/** Angular Imports */
import { Component, Input } from '@angular/core';
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

  /** Visibility. */
  @Input() searchVisible: boolean;
  @Input() iconVisible: boolean;

  /** Resource Options */
  resourceOptions: any[] = [
    {
      name: 'Semua',
      value: 'clients,clientIdentifiers,groups,savings,shares,loans'
    },
    {
      name: 'Anggota',
      value: 'clients,clientIdentifiers'
    },
    {
      name: 'Kelompok',
      value: 'groups'
    },
    {
      name: 'Simpanan',
      value: 'savings'
    },
    {
      name: 'Pembiayaan',
      value: 'loans'
    },
    {
      name: 'Ekuitas',
      value: 'shares'
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
