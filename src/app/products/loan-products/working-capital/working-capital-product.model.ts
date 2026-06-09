/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { StringEnumOptionData } from 'app/shared/models/option-data.model';

export interface WorkingCapitalBreachTemplate {
  breachFrequencyTypeOptions: StringEnumOptionData[];
  breachAmountCalculationTypeOptions: StringEnumOptionData[];
}

export interface WorkingCapitalBreachRequest {
  name: string;
  breachFrequency: number;
  breachFrequencyType: string;
  breachAmountCalculationType: string;
  breachAmount: number;
}
