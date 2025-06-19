import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, ReactiveFormsModule } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';
import { MatFormField, MatPrefix, MatLabel } from '@angular/material/form-field';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-tenant-selector',
  templateUrl: './tenant-selector.component.html',
  styleUrls: ['./tenant-selector.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    MatPrefix,
    FaIconComponent
  ]
})
export class TenantSelectorComponent implements OnInit {
  /** Tenant selector form control. */
  tenantSelector = new UntypedFormControl();

  /**
   * Sets the Tenant Identifier of the application in the selector on initial setup.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private settingsService: SettingsService) {}

  ngOnInit(): void {
    this.tenantSelector.setValue(this.settingsService.tenantIdentifier);
    if (this.tenants.length > 1) {
      this.tenantSelector.enable;
    } else {
      this.tenantSelector.disable;
    }
  }

  /**
   * Returns all the languages supported by the application.
   * @return {string[]} Supported languages.
   */
  get tenants(): string[] {
    return this.settingsService.tenantIdentifiers || [];
  }

  setTenantIdentifier(): void {
    this.settingsService.setTenantIdentifier(this.tenantSelector.value);
  }

  allowSelection(): boolean {
    return this.tenants.length > 1;
  }
}
