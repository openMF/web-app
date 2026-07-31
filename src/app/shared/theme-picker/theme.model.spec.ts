/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DEFAULT_PRIMARY_COLOR_THEME, PRIMARY_COLOR_THEMES, resolvePrimaryColorTheme } from './theme.model';

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
      'purple',
      'orange',
      'red',
      'yellow'
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
      '#ff0000'
    ])('falls back to blue for %p', (value) => {
      expect(resolvePrimaryColorTheme(value).id).toBe('blue');
    });
  });
});
