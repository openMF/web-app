import { Component, Input, Output, EventEmitter, CUSTOM_ELEMENTS_SCHEMA, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

// Import Material Web Components
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/elevated-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/filled-tonal-button.js';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

export type M3ButtonVariant = 'filled' | 'outlined' | 'elevated' | 'text' | 'tonal';

/**
 * Material Design 3 Button Component
 *
 * Wrapper for @material/web button components following Material Design 3 specifications.
 * Uses native Material Design 3 web components with full theming support.
 *
 * Features:
 * - Five button variants: filled, outlined, elevated, text, and tonal
 * - Automatic light/dark theme support
 * - Proper disabled states with gray colors
 * - Hover, focus, and pressed states with ripple effects
 * - Full width support
 * - Icon support (leading and trailing)
 *
 * @example
 * // Basic usage with label input
 * <mifosx-m3-button
 *   variant="filled"
 *   [label]="'Submit'"
 *   (clicked)="onSubmit()">
 * </mifosx-m3-button>
 *
 * @example
 * // With content projection
 * <mifosx-m3-button variant="outlined" (clicked)="onCancel()">
 *   Cancel
 * </mifosx-m3-button>
 *
 * @example
 * // Full width disabled button
 * <mifosx-m3-button
 *   variant="filled"
 *   [label]="'Loading...'"
 *   [disabled]="true"
 *   [fullWidth]="true">
 * </mifosx-m3-button>
 *
 * @example
 * // With translated label
 * <mifosx-m3-button
 *   variant="tonal"
 *   type="submit"
 *   [label]="'labels.buttons.Save' | translate"
 *   (clicked)="onSave()">
 * </mifosx-m3-button>
 */
@Component({
  selector: 'mifosx-m3-button',
  templateUrl: './m3-button.component.html',
  styleUrls: ['./m3-button.component.scss'],
  standalone: true,
  imports: [
    STANDALONE_SHARED_IMPORTS,
    CommonModule
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  encapsulation: ViewEncapsulation.None
})
export class M3ButtonComponent {
  /**
   * Button variant
   * - filled: Solid background (default, highest emphasis)
   * - outlined: Bordered button (medium emphasis)
   * - elevated: Raised button with shadow (medium emphasis)
   * - text: Text-only button (low emphasis)
   * - tonal: Subtle background button (medium emphasis)
   */
  @Input() variant: M3ButtonVariant = 'filled';

  /**
   * Button type attribute
   */
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  /**
   * Disabled state
   */
  @Input() disabled: boolean = false;

  /**
   * Button label text
   */
  @Input() label?: string;

  /**
   * Icon to display before text
   */
  @Input() icon?: string;

  /**
   * Icon to display after text
   */
  @Input() trailingIcon?: string;

  /**
   * Whether the button should take full width
   */
  @Input() fullWidth: boolean = false;

  /**
   * Click event emitter
   */
  @Output() clicked = new EventEmitter<Event>();

  /**
   * Handle button click
   */
  onClick(event: Event): void {
    if (!this.disabled) {
      this.clicked.emit(event);
    }
  }

  /**
   * Get the Material Web Component tag name based on variant
   */
  get componentTag(): string {
    switch (this.variant) {
      case 'filled':
        return 'md-filled-button';
      case 'outlined':
        return 'md-outlined-button';
      case 'elevated':
        return 'md-elevated-button';
      case 'text':
        return 'md-text-button';
      case 'tonal':
        return 'md-filled-tonal-button';
      default:
        return 'md-filled-button';
    }
  }

  /**
   * Get container classes
   */
  get containerClasses(): string {
    return this.fullWidth ? 'm3-button-container--full-width' : 'm3-button-container';
  }
}
