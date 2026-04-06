/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Charge, Currency } from 'app/shared/models/general.model';
import { OptionData } from 'app/shared/models/option-data.model';

export interface LoanCharge {
  id: number;
  chargeId: number;
  name: string;
  chargeTimeType: Charge;
  submittedOnDate: number[];
  dueDate: number[];
  chargeCalculationType: OptionData;
  percentage: number;
  amountPercentageAppliedTo: number;
  currency: Currency;
  amount: number;
  amountPaid: number;
  amountWaived: number;
  amountWrittenOff: number;
  amountOutstanding: number;
  amountOrPercentage: number;
  penalty: boolean;
  chargePaymentMode: OptionData;
  chargeTime: OptionData;
  paid: boolean;
  waived: boolean;
  chargePayable: boolean;
  loanId: number;
  externalId: string;
  externalLoanId: string;
}
