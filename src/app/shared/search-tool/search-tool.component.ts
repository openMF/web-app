/** Angular Imports */
import { Component } from '@angular/core';
import { style, animate, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatSelect } from '@angular/material/select';
import { MatOption } from '@angular/material/autocomplete';
import { MatIconButton } from '@angular/material/button';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { TranslatePipe as NgxTranslatePipe } from '@ngx-translate/core';
import { TranslatePipe } from '@pipes/translate.pipe';

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
        animate(500, style({ opacity: 1 }))]),
      transition(':leave', [
        animate(500, style({ opacity: 0 }))])

    ])

  ],
  imports: [
    NgIf,
    MatFormField,
    MatLabel,
    MatInput,
    ReactiveFormsModule,
    MatSelect,
    NgFor,
    MatOption,
    MatIconButton,
    FaIconComponent,
    MatTooltip,
    TranslatePipe,
    NgxTranslatePipe
  ]
})
export class SearchToolComponent {
  /** Query Form Control */
  query = new UntypedFormControl('');
  /** Resource Form Control */
  resource = new UntypedFormControl('');

  /** Sets the initial visibility of search input as hidden. Visible if true. */
  searchVisible = false;
  /** Resource Options */
  resourceOptions: any[] = [
    {
      name: 'All',
      value: 'clients,clientIdentifiers,groups,savings,shares,loans'
    },
    {
      name: 'Clients',
      value: 'clients,clientIdentifiers'
    },
    {
      name: 'Groups',
      value: 'groups'
    },
    {
      name: 'Savings',
      value: 'savings'
    },
    {
      name: 'Shares',
      value: 'shares'
    },
    {
      name: 'Loans',
      value: 'loans'
    }
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
