/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, inject } from '@angular/core';

/** Custom Services */
import { AlertService } from 'app/core/alert/alert.service';
import { TranslateService } from '@ngx-translate/core';
import { BrandingService, TenantBranding } from 'app/shared/theme-picker/branding.service';
import { ThemeStorageService } from 'app/shared/theme-picker/theme-storage.service';

/** Custom Models */
import { resolvePrimaryColorTheme, Theme } from 'app/shared/theme-picker/theme.model';
import { ThemePickerComponent } from 'app/shared/theme-picker/theme-picker.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

/**
 * Theme component.
 *
 * Administers the tenant's brand colour. The colour is stored by the Mifos
 * self-service plugin, per tenant, so every user of the tenant sees the same
 * branding; this page is a presentation layer over the plugin's `/branding`
 * endpoint rather than a separate settings store.
 */
@Component({
  selector: 'mifosx-theme',
  templateUrl: './theme.component.html',
  styleUrls: ['./theme.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    ThemePickerComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThemeComponent implements OnInit, OnDestroy {
  private brandingService = inject(BrandingService);
  private themeStorageService = inject(ThemeStorageService);
  private alertService = inject(AlertService);
  private translateService = inject(TranslateService);
  private changeDetectorRef = inject(ChangeDetectorRef);

  /** Colour currently saved for the tenant. */
  savedTheme: Theme;
  /** Colour selected in the picker but not yet saved. */
  selectedTheme: Theme;
  /** True when the branding endpoint could not be read. */
  unavailable = false;
  /** True while a save is in flight. */
  saving = false;

  ngOnInit() {
    this.savedTheme = this.themeStorageService.getCachedTheme();
    this.selectedTheme = this.savedTheme;

    this.brandingService.getTenantBranding().subscribe({
      next: (branding: TenantBranding) => {
        this.savedTheme = resolvePrimaryColorTheme(branding?.primaryColor);
        this.selectedTheme = this.savedTheme;
        this.themeStorageService.previewTheme(this.savedTheme);
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        // Deployment without the self-service plugin, or no read permission.
        this.unavailable = true;
        this.changeDetectorRef.markForCheck();
      }
    });
  }

  /**
   * Restores the saved colour if the administrator leaves without saving, so a
   * preview never outlives this page.
   */
  ngOnDestroy() {
    if (this.selectedTheme?.id !== this.savedTheme?.id) {
      this.themeStorageService.previewTheme(this.savedTheme);
    }
  }

  /** True when there is an unsaved selection. */
  get hasChanges(): boolean {
    return !this.unavailable && this.selectedTheme?.id !== this.savedTheme?.id;
  }

  /**
   * Records the picked colour. The picker has already applied it, so the
   * administrator previews the change before committing it.
   * @param {Theme} theme
   */
  onThemeSelected(theme: Theme) {
    this.selectedTheme = theme;
  }

  /** Discards the preview and returns to the saved colour. */
  reset() {
    this.selectedTheme = this.savedTheme;
    this.themeStorageService.previewTheme(this.savedTheme);
  }

  /** Persists the selected colour as the tenant's branding. */
  submit() {
    if (!this.hasChanges || this.saving) {
      return;
    }
    this.saving = true;
    const theme = this.selectedTheme;

    this.brandingService.updateTenantBranding(theme.id).subscribe({
      next: () => {
        this.savedTheme = theme;
        this.saving = false;
        this.themeStorageService.installTheme(theme);
        this.alertService.alert({
          type: 'Configuration Updated',
          message: this.translateService.instant('labels.text.Tenant theme updated successfully')
        });
        this.changeDetectorRef.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.reset();
        this.changeDetectorRef.markForCheck();
      }
    });
  }
}
