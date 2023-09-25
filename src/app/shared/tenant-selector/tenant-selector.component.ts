import { Component, OnInit } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { SettingsService } from 'app/settings/settings.service';

@Component({
  selector: 'mifosx-tenant-selector',
  templateUrl: './tenant-selector.component.html',
  styleUrls: ['./tenant-selector.component.scss']
})
export class TenantSelectorComponent implements OnInit {

  /** Tenant selector form control. */
  tenantSelector = new UntypedFormControl();

  /**
   * Sets the Tenant Identifier of the application in the selector on initial setup.
   * @param {SettingsService} settingsService Settings Service.
   */
  constructor(private settingsService: SettingsService) {
    this.tenantSelector.setValue(this.settingsService.tenantIdentifier);
  }

  ngOnInit(): void {
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
    return (this.tenants.length > 1);
  }

}
