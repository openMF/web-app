/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { FormatNumberPipe } from '@pipes/format-number.pipe';
import { NearBreach } from 'app/products/loan-products/models/loan-product.model';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-view-near-breach-configuration',
  templateUrl: './view-near-breach-configuration.component.html',
  styleUrl: './view-near-breach-configuration.component.scss',
  standalone: true,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    FormatNumberPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ViewNearBreachConfigurationComponent implements OnInit {
  private route = inject(ActivatedRoute);

  nearBreachData: NearBreach | null = null;

  constructor() {}

  ngOnInit(): void {
    this.route.data.subscribe((data: { nearBreachData: any }) => {
      this.nearBreachData = data.nearBreachData;
    });
  }
}
