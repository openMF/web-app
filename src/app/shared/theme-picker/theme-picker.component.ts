/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
  inject
} from '@angular/core';

/** Custom Model */
import {
  createCustomTheme,
  DEFAULT_PRIMARY_COLOR_THEME,
  normalizeHexColor,
  PRIMARY_COLOR_THEMES,
  Theme
} from './theme.model';

/** Custom Services */
import { ThemeStorageService } from './theme-storage.service';
import { MatTooltip } from '@angular/material/tooltip';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Theme picker component.
 *
 * TODO: Customization of theme for every component and custom background with darker contrast.
 */
@Component({
  selector: 'mifosx-theme-picker',
  templateUrl: './theme-picker.component.html',
  styleUrls: ['./theme-picker.component.scss'],
  encapsulation: ViewEncapsulation.None,
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatTooltip,
    FaIconComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemePickerComponent implements OnInit {
  themeStorageService = inject(ThemeStorageService);

  /**
   * Theme to show as selected. Lets the host stay authoritative once the
   * tenant's configured colour has been read from the server.
   */
  @Input() set selected(theme: Theme) {
    if (theme) {
      this.currentTheme = theme;
      this.syncCustomColor();
    }
  }

  /** Emits the theme the user picked, for the host to persist. */
  @Output() themeSelected = new EventEmitter<Theme>();

  /** Theme shown as selected; set by the host, else resolved in ngOnInit. */
  currentTheme: Theme;
  /** Available themes for the application. */
  themes = PRIMARY_COLOR_THEMES;
  /** Hue shown in the free colour controls, always the one actually applied. */
  customColor: string = DEFAULT_PRIMARY_COLOR_THEME.primary;
  /** True when the last picked hue had to be darkened to stay legible. */
  contrastAdjusted = false;

  /**
   * Falls back to the cached colour until the host supplies a selection.
   */
  ngOnInit() {
    this.currentTheme ??= this.themeStorageService.getCachedTheme();
    this.syncCustomColor();
  }

  /**
   * Selects a theme and applies it. Persisting the choice is the caller's
   * responsibility, since the colour is tenant configuration.
   * @param {Theme} theme
   */
  installTheme(theme: Theme) {
    this.currentTheme = theme;
    if (!theme.isCustom) {
      this.contrastAdjusted = false;
    }
    this.themeStorageService.previewTheme(theme);
    this.themeSelected.emit(theme);
  }

  /**
   * Keeps one swatch reachable by Tab. The selected preset owns the tab stop,
   * as a radio group requires; with a custom colour selected no preset is, so
   * the first one takes it rather than leaving the group unreachable.
   * @param {number} index Index of the swatch.
   * @returns {boolean} True when the swatch is the group's tab stop.
   */
  isTabbable(index: number): boolean {
    const selectedIndex = this.themes.findIndex((theme) => theme.id === this.currentTheme.id);
    return index === (selectedIndex === -1 ? 0 : selectedIndex);
  }

  /**
   * Applies the hue chosen in the colour well, which reports every drag step.
   * @param {Event} event
   */
  onCustomColorPicked(event: Event) {
    this.applyCustomColor((event.target as HTMLInputElement).value);
  }

  /**
   * Applies a typed hex, restoring the field when it is not a colour so the
   * text never disagrees with what is applied.
   * @param {Event} event
   */
  onCustomHexEntered(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!this.applyCustomColor(input.value)) {
      input.value = this.customColor;
    }
  }

  /**
   * @param {string} value Colour as typed or picked.
   * @returns {boolean} True when it was a colour and has been applied.
   */
  private applyCustomColor(value: string): boolean {
    const theme = createCustomTheme(value);
    if (!theme) {
      return false;
    }
    // Reported rather than silently corrected: the administrator gets the
    // nearest legible hue, and is told the one they picked was not.
    this.contrastAdjusted = theme.primary !== normalizeHexColor(value);
    this.customColor = theme.primary;
    this.installTheme(theme);
    return true;
  }

  /** Points the free colour controls at the selection when it is a custom one. */
  private syncCustomColor() {
    if (this.currentTheme?.isCustom) {
      this.customColor = this.currentTheme.primary;
    }
  }

  /**
   * Moves the selection with the arrow keys, as expected of a radio group.
   * @param {KeyboardEvent} event
   * @param {number} index Index of the focused swatch.
   */
  onKeydown(event: KeyboardEvent, index: number) {
    const offsets: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    const offset = offsets[event.key];
    if (!offset) {
      return;
    }
    event.preventDefault();
    const next = (index + offset + this.themes.length) % this.themes.length;
    this.installTheme(this.themes[next]);
    const swatches = (event.currentTarget as HTMLElement).parentElement?.children;
    (swatches?.item(next) as HTMLElement)?.focus();
  }
}
