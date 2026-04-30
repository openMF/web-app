/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostListener,
  ViewChild,
  inject
} from '@angular/core';
import { style, animate, transition, trigger } from '@angular/animations';
import { Router } from '@angular/router';
import { UntypedFormControl } from '@angular/forms';
import { MatIconButton } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { MatTooltip } from '@angular/material/tooltip';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Search Tool Component — renders a toolbar icon that opens a centred modal.
 */
@Component({
  selector: 'mifosx-search-tool',
  templateUrl: './search-tool.component.html',
  styleUrls: ['./search-tool.component.scss'],
  animations: [
    trigger('backdropFade', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('180ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('140ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modalSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-14px) scale(0.96)' }),
        animate('220ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('140ms ease-in', style({ opacity: 0, transform: 'translateY(-8px) scale(0.97)' }))
      ])
    ])
  ],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatIconButton,
    MatIcon,
    FaIconComponent,
    MatTooltip
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SearchToolComponent {
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  @ViewChild('queryInput') queryInput: ElementRef<HTMLInputElement>;

  /** Query Form Control */
  query = new UntypedFormControl('');
  /** Resource Form Control */
  resource = new UntypedFormControl('');

  /** Controls modal visibility */
  searchVisible = false;

  /** Resource Options */
  resourceOptions: any[] = [
    { name: 'All', value: 'clients,clientIdentifiers,groups,savings,shares,loans' },
    { name: 'Clients', value: 'clients,clientIdentifiers' },
    { name: 'Groups', value: 'groups' },
    { name: 'Savings', value: 'savings' },
    { name: 'Shares', value: 'shares' },
    { name: 'Loans', value: 'loans' }
  ];

  constructor() {
    this.resource.patchValue('clients,clientIdentifiers,groups,savings,shares,loans');
    this.query.patchValue('');
  }

  /** Close modal on Escape key anywhere in the document. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.searchVisible) {
      this.closeModal();
    }
  }

  /** Toggles the modal open/closed. */
  toggleSearchVisibility(): void {
    if (this.searchVisible) {
      this.closeModal();
    } else {
      this.searchVisible = true;
      setTimeout(() => this.queryInput?.nativeElement.focus(), 60);
    }
  }

  /** Closes the modal and marks the view for re-render under OnPush. */
  closeModal(): void {
    this.searchVisible = false;
    this.cdr.markForCheck();
  }

  /** Executes search and closes the modal. */
  search(): void {
    const queryParams: any = {
      query: this.query.value,
      resource: this.resource.value
    };
    this.closeModal();
    this.router.navigate(['/search'], { queryParams });
  }
}
