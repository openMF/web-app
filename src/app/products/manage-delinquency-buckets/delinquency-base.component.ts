/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { DELINQUENCY_BUCKET_TYPE, DelinquencyBucketType } from './models/delinquency-models';

export abstract class DelinquencyBucketBaseComponent {
  protected route = inject(ActivatedRoute);

  delinquencyBucketType = new BehaviorSubject<DelinquencyBucketType>(DELINQUENCY_BUCKET_TYPE.REGULAR);

  constructor() {
    this.initialize(this.route.snapshot.queryParamMap.get('bucketType') || 'regular');
  }

  initialize(productType: string): void {
    if (productType === 'regular') {
      this.delinquencyBucketType.next(DELINQUENCY_BUCKET_TYPE.REGULAR);
    } else if (productType === 'workingcapital') {
      this.delinquencyBucketType.next(DELINQUENCY_BUCKET_TYPE.WORKING_CAPITAL);
    }
  }

  get isWorkingCapitalBucket(): boolean {
    return DELINQUENCY_BUCKET_TYPE.WORKING_CAPITAL === this.delinquencyBucketType.value;
  }

  get isRegularBucket(): boolean {
    return DELINQUENCY_BUCKET_TYPE.REGULAR === this.delinquencyBucketType.value;
  }

  bucketTypeLabel(bucketType: string): string {
    if (bucketType === 'REGULAR') {
      return 'Regular';
    }
    if (bucketType === 'WORKING_CAPITAL') {
      return 'Working Capital';
    }
    return '';
  }

  bucketType(bucketType: string): string {
    if (bucketType === 'REGULAR') {
      return 'regular';
    }
    if (bucketType === 'WORKING_CAPITAL') {
      return 'workingcapital';
    }
    return '';
  }

  getCatalogLabel(inputText: string): string {
    const datas = inputText.split('.');
    return this.camalize(datas[1]);
  }

  camalize(word: string) {
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }
}
