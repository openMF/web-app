/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Theme model.
 *
 * `primary` / `light` / `dark` are pushed into the `--brand-primary-*` custom
 * properties at runtime, which is what recolours the application.
 */
export interface Theme {
  id: string;
  /** Translation key suffix under `labels.inputs.`, used as the accessible name. */
  name: string;
  primary: string;
  light: string;
  dark: string;
  isDefault?: boolean;
}

/**
 * Path of the branding endpoint, relative to the platform API base.
 *
 * Owned by the Mifos self-service plugin rather than Fineract itself, and stored per tenant in the
 * plugin's own table, so every user of a tenant reads the same value and other tenants are
 * unaffected. Absent on deployments that do not install the plugin.
 */
export const BRANDING_API_PATH = '/branding';

/**
 * Selectable primary colours.
 *
 * Every `primary` scores >= 4.5:1 against white, because the Sass palette pairs
 * hue 500 with a white contrast colour. `yellow` is therefore a dark gold: a
 * bright yellow cannot carry white label text without failing WCAG AA.
 */
export const PRIMARY_COLOR_THEMES: Theme[] = [
  { id: 'blue', name: 'Blue', primary: '#1074b9', light: '#5ba2ec', dark: '#004989', isDefault: true },
  { id: 'green', name: 'Green', primary: '#2e7d32', light: '#7cc47f', dark: '#1b5e20' },
  { id: 'purple', name: 'Purple', primary: '#6a1b9a', light: '#c3a0ea', dark: '#4a148c' },
  { id: 'orange', name: 'Orange', primary: '#bf5000', light: '#ffb74d', dark: '#8f3b00' },
  { id: 'red', name: 'Red', primary: '#c62828', light: '#ef8c8c', dark: '#8e0000' },
  { id: 'yellow', name: 'Yellow', primary: '#8f6a00', light: '#ffd54f', dark: '#6b5000' }
];

/** Applied when the tenant has no valid configured colour. */
export const DEFAULT_PRIMARY_COLOR_THEME: Theme = PRIMARY_COLOR_THEMES[0];

/**
 * Resolves a configured theme id to a theme.
 *
 * Falls back to the default for a missing, blank or unrecognised value, which
 * is also what keeps an unexpected server value from reaching the stylesheet.
 * @param {string} themeId Configured theme id.
 * @returns {Theme} Matching theme, or the default.
 */
export function resolvePrimaryColorTheme(themeId?: string | null): Theme {
  const normalized = themeId?.trim().toLowerCase();
  return PRIMARY_COLOR_THEMES.find((theme) => theme.id === normalized) ?? DEFAULT_PRIMARY_COLOR_THEME;
}
