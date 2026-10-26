/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export type ActionCardType = 'client' | 'loan' | 'savings' | 'insight' | 'confirmation';

export type ActionButtonStyle = 'primary' | 'warn' | 'accent';

/** A button rendered inside an action card. */
export interface ActionCardButton {
  label: string;
  style: ActionButtonStyle;
  /** MCP tool/action to invoke on click. */
  action?: string;
  /** Angular route to navigate to on click. */
  route?: string;
}

/** Structured, non-prose response block rendered as a Material card. */
export interface ActionCard {
  type: ActionCardType;
  title: string;
  /** Ordered label/value rows shown in the card body. */
  data: Record<string, string>;
  actions?: ActionCardButton[];
}
