/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Minimal parsed shape of a breach action needed to evaluate the disable state. */
export interface BreachDisableWindow {
  action: string;
  startDateObj: Date;
  endDateObj: Date | null;
}

/**
 * Finds the DISABLE window covering the business date, if any.
 *
 * A loan can chain several DISABLE→ENABLE cycles, so this looks for the one
 * window that contains the business date rather than trusting the order of
 * the array.
 */
export function findActiveBreachDisable<T extends BreachDisableWindow>(rows: T[], businessDate: Date): T | null {
  const time = businessDate.getTime();
  return (
    rows.find(
      (row) =>
        row.action === 'DISABLE' &&
        row.startDateObj.getTime() <= time &&
        (row.endDateObj === null || row.endDateObj.getTime() >= time)
    ) ?? null
  );
}
