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
  /**
   * True when the theme was derived from a hue the administrator picked rather
   * than chosen from the presets. Such a theme has no translated name, so the
   * UI labels it with `labels.inputs.Custom` and the hex itself.
   */
  isCustom?: boolean;
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
  { id: 'light-green', name: 'Light Green', primary: '#5a7d0c', light: '#c5e1a5', dark: '#3d5600' },
  { id: 'purple', name: 'Purple', primary: '#6a1b9a', light: '#c3a0ea', dark: '#4a148c' },
  { id: 'pink', name: 'Pink', primary: '#ad1457', light: '#f48fb1', dark: '#78002e' },
  { id: 'orange', name: 'Orange', primary: '#bf5000', light: '#ffb74d', dark: '#8f3b00' },
  { id: 'red', name: 'Red', primary: '#c62828', light: '#ef8c8c', dark: '#8e0000' },
  { id: 'yellow', name: 'Yellow', primary: '#8f6a00', light: '#ffd54f', dark: '#6b5000' },
  { id: 'black', name: 'Black', primary: '#212121', light: '#9e9e9e', dark: '#000000' }
];

/** Applied when the tenant has no valid configured colour. */
export const DEFAULT_PRIMARY_COLOR_THEME: Theme = PRIMARY_COLOR_THEMES[0];

/**
 * Smallest contrast a primary hue may have against white.
 *
 * The Sass palette pairs hue 500 with a white contrast colour, so a primary the
 * administrator picks freely still has to carry white label text. WCAG AA for
 * normal text is 4.5:1.
 */
export const MIN_PRIMARY_CONTRAST_WITH_WHITE = 4.5;

/** `#rgb` or `#rrggbb`, the two forms `<input type="color">` and users produce. */
const HEX_COLOR_PATTERN = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;

/**
 * Normalises a hex colour to lowercase `#rrggbb`.
 * @param {string} value Colour as typed or picked.
 * @returns {string} Normalised colour, or null when it is not a hex colour.
 */
export function normalizeHexColor(value?: string | null): string | null {
  const trimmed = value?.trim().toLowerCase();
  if (!trimmed || !HEX_COLOR_PATTERN.test(trimmed)) {
    return null;
  }
  const digits = trimmed.slice(1);
  return digits.length === 3
    ? `#${digits
        .split('')
        .map((digit) => digit + digit)
        .join('')}`
    : trimmed;
}

/** @returns {number[]} Red, green and blue of a `#rrggbb` colour, 0-255. */
function toChannels(hex: string): number[] {
  return [
    1,
    3,
    5
  ].map((offset) => parseInt(hex.slice(offset, offset + 2), 16));
}

/** @returns {string} `#rrggbb` for channels, clamped and rounded. */
function toHex(channels: number[]): string {
  return `#${channels
    .map((channel) =>
      Math.max(0, Math.min(255, Math.round(channel)))
        .toString(16)
        .padStart(2, '0')
    )
    .join('')}`;
}

/** @returns {number} Relative luminance per WCAG 2.1. */
function relativeLuminance(channels: number[]): number {
  const [
    red,
    green,
    blue
  ] = channels.map((channel) => {
    const ratio = channel / 255;
    return ratio <= 0.04045 ? ratio / 12.92 : Math.pow((ratio + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * red + 0.7152 * green + 0.0722 * blue;
}

/** @returns {number} Contrast ratio of the colour against white. */
function contrastWithWhite(channels: number[]): number {
  return 1.05 / (relativeLuminance(channels) + 0.05);
}

/** @returns {number[]} Channels rounded to whole 0-255 values. */
function roundChannels(channels: number[]): number[] {
  return channels.map((channel) => Math.round(channel));
}

/** @returns {number[]} Channels scaled towards black by `factor`. */
function scaleChannels(channels: number[], factor: number): number[] {
  return channels.map((channel) => channel * factor);
}

/** @returns {number[]} Channels mixed with white, `amount` being the share of white. */
function mixWithWhite(channels: number[], amount: number): number[] {
  return channels.map((channel) => channel + (255 - channel) * amount);
}

/**
 * Darkens a hue just far enough to carry white text.
 *
 * A freely picked colour is often too light for the white label text the
 * palette pairs with hue 500 - a pure red is only 4:1 - so it is stepped
 * towards black until it passes. Stepping by a fixed factor reaches black well
 * inside the iteration cap, so this always terminates, and it is idempotent:
 * a hue that already passes is returned untouched, which is what lets a stored
 * custom colour resolve back to itself on the next page load.
 * @param {number[]} channels Picked hue.
 * @returns {number[]} Hue that meets the contrast floor.
 */
function darkenUntilLegible(channels: number[]): number[] {
  // Rounded on every step, so the contrast measured is the one the emitted
  // `#rrggbb` actually has rather than the one a fractional channel would have.
  let current = roundChannels(channels);
  for (let step = 0; step < 200 && contrastWithWhite(current) < MIN_PRIMARY_CONTRAST_WITH_WHITE; step++) {
    current = roundChannels(scaleChannels(current, 0.97));
  }
  return current;
}

/**
 * Builds a theme from a colour the administrator picked.
 *
 * The picked hue becomes the primary, darkened if it could not carry white
 * text, and the 100 / 700 hues are derived from it so the whole palette moves
 * together. The theme's id is its own primary, which is what gets stored for
 * the tenant.
 * @param {string} value Colour as typed or picked, `#rgb` or `#rrggbb`.
 * @returns {Theme} Custom theme, or null when the value is not a hex colour.
 */
export function createCustomTheme(value?: string | null): Theme | null {
  const hex = normalizeHexColor(value);
  if (!hex) {
    return null;
  }
  const primary = darkenUntilLegible(toChannels(hex));
  return {
    id: toHex(primary),
    name: 'Custom',
    primary: toHex(primary),
    light: toHex(mixWithWhite(primary, 0.6)),
    dark: toHex(scaleChannels(primary, 0.7)),
    isCustom: true
  };
}

/**
 * Resolves a configured theme id to a theme.
 *
 * A preset id wins; otherwise a hex colour is rebuilt as a custom theme, since
 * that is how a freely picked colour is stored. Falls back to the default for a
 * missing, blank or unrecognised value, which is also what keeps an unexpected
 * server value from reaching the stylesheet.
 * @param {string} themeId Configured theme id.
 * @returns {Theme} Matching theme, or the default.
 */
export function resolvePrimaryColorTheme(themeId?: string | null): Theme {
  const normalized = themeId?.trim().toLowerCase();
  const preset = PRIMARY_COLOR_THEMES.find((theme) => theme.id === normalized);
  return preset ?? createCustomTheme(normalized) ?? DEFAULT_PRIMARY_COLOR_THEME;
}
