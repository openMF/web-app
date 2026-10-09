/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormControl } from '@angular/forms';

export interface RepaymentForm {
  transactionDate: FormControl<Date | null>;
  externalId: FormControl<string | null>;
  paymentTypeId: FormControl<string | null>;
  note: FormControl<string | null>;
  skipInterestRefund: FormControl<boolean | null>;
  transactionAmount: FormControl<number | null>;
  classificationId?: FormControl<string | null>;
  accountNumber?: FormControl<string | null>;
  checkNumber?: FormControl<string | null>;
  routingCode?: FormControl<string | null>;
  receiptNumber?: FormControl<string | null>;
  bankNumber?: FormControl<string | null>;
}
