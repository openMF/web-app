/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { IconName } from '@fortawesome/fontawesome-svg-core';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/** Single navigable card definition. */
export interface MenuCard {
  /** Translation key for the card label. */
  label: string;
  /** FontAwesome icon name. */
  icon: IconName;
  /** Router path navigated to on click. */
  path: any[];
  /** Permission(s) required to display the card. */
  permission: string | string[];
}

/**
 * Card Menu component.
 *
 * Generic landing page that renders a grid of navigable cards. The page
 * title and cards are supplied via the route's `data` (`pageTitle`, `cards`),
 * so it can back the Member Management, Reports and Admin sections.
 */
@Component({
  selector: 'mifosx-card-menu',
  standalone: true,
  templateUrl: './card-menu.component.html',
  styleUrls: ['./card-menu.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CardMenuComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  /** Cards shown on the page. */
  cards: MenuCard[] = [];

  ngOnInit(): void {
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data) => {
      this.cards = data['cards'] ?? [];
    });
  }
}
