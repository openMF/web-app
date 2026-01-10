import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

export type M3IconStyle = 'outlined' | 'filled' | 'rounded' | 'sharp';

/**
 * Material Design 3 Icon Component
 *
 * Wrapper for Material Symbols icons following Material Design 3 specifications.
 * Uses Google's Material Symbols font for consistent iconography.
 *
 * Features:
 * - Multiple icon styles: outlined (default), filled, rounded, and sharp
 * - Automatic theme support
 * - Size control
 * - Color customization via CSS
 *
 * @example
 * // Basic usage
 * <mifosx-m3-icon name="account_circle"></mifosx-m3-icon>
 *
 * @example
 * // With filled style
 * <mifosx-m3-icon name="lock" style="filled"></mifosx-m3-icon>
 *
 * @example
 * // With custom size
 * <mifosx-m3-icon name="visibility" [size]="24"></mifosx-m3-icon>
 *
 * Common icon mappings from Font Awesome:
 * - user-circle → account_circle
 * - lock → lock
 * - eye → visibility
 * - eye-slash → visibility_off
 * - home → home
 * - search → search
 * - settings → settings
 * - menu → menu
 * - close → close
 */
@Component({
  selector: 'mifosx-m3-icon',
  templateUrl: './m3-icon.component.html',
  styleUrls: ['./m3-icon.component.scss'],
  standalone: true,
  imports: [CommonModule],
  encapsulation: ViewEncapsulation.None
})
export class M3IconComponent {
  /**
   * Icon name from Material Symbols
   * See: https://fonts.google.com/icons
   */
  @Input() name!: string;

  /**
   * Icon style variant
   * - outlined: Default style with strokes (default)
   * - filled: Solid filled icons
   * - rounded: Rounded corner icons
   * - sharp: Sharp corner icons
   */
  @Input() style: M3IconStyle = 'outlined';

  /**
   * Icon size in pixels
   * Default is 24px (Material Design standard)
   */
  @Input() size: number = 24;

  /**
   * Whether the icon should be filled (alternative to style="filled")
   * This is a convenience property for backwards compatibility
   */
  @Input() filled: boolean = false;

  /**
   * Get the CSS class for the icon style
   */
  get iconClass(): string {
    const styleToUse = this.filled ? 'filled' : this.style;
    return `material-symbols-${styleToUse}`;
  }

  /**
   * Get the inline styles for the icon
   */
  get iconStyles(): { [key: string]: string } {
    return {
      'font-size': `${this.size}px`,
      width: `${this.size}px`,
      height: `${this.size}px`
    };
  }
}
