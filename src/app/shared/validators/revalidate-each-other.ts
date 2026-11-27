/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

/**
 * Re-runs the validators of two controls whenever the other one changes.
 *
 * A control's validators only run when its own value changes, so a validator
 * that compares against a sibling (such as a min against a max) keeps a stale
 * result after the user edits the sibling.
 */
export function revalidateEachOther(form: AbstractControl, first: string, second: string): Subscription {
  const a = form.get(first);
  const b = form.get(second);
  const subscription = a.valueChanges.subscribe(() => b.updateValueAndValidity({ emitEvent: false }));
  subscription.add(b.valueChanges.subscribe(() => a.updateValueAndValidity({ emitEvent: false })));
  return subscription;
}
