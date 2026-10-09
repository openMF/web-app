/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  createCustomTheme,
  DEFAULT_PRIMARY_COLOR_THEME,
  MIN_PRIMARY_CONTRAST_WITH_WHITE,
  normalizeHexColor,
  PRIMARY_COLOR_THEMES,
  resolvePrimaryColorTheme
} from './theme.model';

/** Relative luminance per WCAG 2.1. */
function luminance(hex: string): number {
  const channels = [
    hex.slice(1, 3),
    hex.slice(3, 5),
    hex.slice(5, 7)
  ].map((part) => {
    const channel = parseInt(part, 16) / 255;
    return channel <= 0.04045 ? channel / 12.92 : Math.pow((channel + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
}

function contrastWithWhite(hex: string): number {
  return 1.05 / (luminance(hex) + 0.05);
}

describe('primary colour themes', () => {
  it('offers exactly the tenant branding presets', () => {
    expect(PRIMARY_COLOR_THEMES.map((theme) => theme.id)).toEqual([
      'blue',
      'green',
      'light-green',
      'purple',
      'pink',
      'orange',
      'red',
      'yellow',
      'black'
    ]);
  });

  it('defaults to blue', () => {
    expect(DEFAULT_PRIMARY_COLOR_THEME.id).toBe('blue');
  });

  it('keeps white label text legible on every primary and dark hue', () => {
    for (const theme of PRIMARY_COLOR_THEMES) {
      expect(contrastWithWhite(theme.primary)).toBeGreaterThanOrEqual(4.5);
      expect(contrastWithWhite(theme.dark)).toBeGreaterThanOrEqual(4.5);
    }
  });

  describe('resolvePrimaryColorTheme', () => {
    it('resolves a known id', () => {
      expect(resolvePrimaryColorTheme('green').id).toBe('green');
    });

    it('tolerates surrounding whitespace and casing', () => {
      expect(resolvePrimaryColorTheme('  YELLOW ').id).toBe('yellow');
    });

    it.each([
      null,
      undefined,
      '',
      '   ',
      'chartreuse',
      '#12345',
      '#gggggg'
    ])('falls back to blue for %p', (value) => {
      expect(resolvePrimaryColorTheme(value).id).toBe('blue');
    });

    it('rebuilds a stored hex as a custom theme', () => {
      const theme = resolvePrimaryColorTheme('#6a1b9a');
      expect(theme.isCustom).toBe(true);
      expect(theme.primary).toBe('#6a1b9a');
    });

    it('resolves a stored custom colour back to itself', () => {
      // The id is what gets stored, so re-resolving it has to be a no-op or the
      // tenant's colour would drift a shade darker on every page load.
      const picked = createCustomTheme('#ff0000');
      expect(resolvePrimaryColorTheme(picked.id)).toEqual(picked);
    });
  });

  describe('normalizeHexColor', () => {
    it('expands the short form and lowercases it', () => {
      expect(normalizeHexColor('  #AbC ')).toBe('#aabbcc');
    });

    it.each([
      null,
      undefined,
      '',
      'red',
      '123456',
      '#12345'
    ])('rejects %p', (value) => {
      expect(normalizeHexColor(value)).toBeNull();
    });
  });

  describe('createCustomTheme', () => {
    it('keeps a hue that already carries white text', () => {
      expect(createCustomTheme('#6a1b9a').primary).toBe('#6a1b9a');
    });

    it('darkens a hue that cannot carry white text', () => {
      // Pure red is only 4:1 against white.
      const theme = createCustomTheme('#ff0000');
      expect(theme.primary).not.toBe('#ff0000');
      expect(contrastWithWhite(theme.primary)).toBeGreaterThanOrEqual(MIN_PRIMARY_CONTRAST_WITH_WHITE);
    });

    it('keeps white label text legible on any picked hue', () => {
      for (const picked of [
        '#ffffff',
        '#ffff00',
        '#00ff00',
        '#ff00ff',
        '#000000',
        '#7fffd4'
      ]) {
        const theme = createCustomTheme(picked);
        expect(contrastWithWhite(theme.primary)).toBeGreaterThanOrEqual(MIN_PRIMARY_CONTRAST_WITH_WHITE);
        expect(contrastWithWhite(theme.dark)).toBeGreaterThanOrEqual(MIN_PRIMARY_CONTRAST_WITH_WHITE);
      }
    });

    it('derives a light hue that carries dark text', () => {
      // Hue 100 is paired with near-black text by the palette.
      const theme = createCustomTheme('#1074b9');
      expect(luminance(theme.light)).toBeGreaterThan(luminance(theme.primary));
    });

    it('returns null for a value that is not a colour', () => {
      expect(createCustomTheme('chartreuse')).toBeNull();
    });
  });
});
