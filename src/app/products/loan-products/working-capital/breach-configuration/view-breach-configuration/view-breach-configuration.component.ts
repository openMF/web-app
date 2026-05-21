/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { Breach } from 'app/products/loan-products/models/loan-product.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-breach-configuration',
  templateUrl: './view-breach-configuration.component.html',
  styleUrl: './view-breach-configuration.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewBreachConfigurationComponent {
  private route = inject(ActivatedRoute);

  breachData: Breach | null = null;

  constructor() {
    this.route.data.subscribe((data: { breachData: any }) => {
      this.breachData = data.breachData;
    });
  }
}
