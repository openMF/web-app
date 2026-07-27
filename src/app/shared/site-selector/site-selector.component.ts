import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { OrganizationService } from 'app/organization/organization.service';
import { SettingsService } from 'app/settings/settings.service';

/**
 * Emitted whenever the region, district or site selection changes.
 */
export interface SiteSelectorChange {
  regionId: number | null;
  regionName: string | null;
  districtId: number | null;
  districtName: string | null;
  siteIds: number[] | null;
}

/**
 * Site Selector Component.
 *
 * Displays a Country (read only, informational), Region, District and
 * Site (optional, defaults to "All Sites") cascading set of dropdowns.
 *
 * The component walks the office hierarchy using
 * `OrganizationService.fetchByHierarchyLevel` starting from the country/root
 * office supplied via `@Input() countryId`, populating the Region dropdown,
 * then the District dropdown (children of the selected Region) and finally
 * the Site dropdown (children of the selected District). The Site dropdown
 * always includes an "All Sites" option which is selected by default.
 */
@Component({
  selector: 'mifosx-site-selector',
  templateUrl: './site-selector.component.html',
  styleUrls: ['./site-selector.component.scss'],
})
export class SiteSelectorComponent implements OnInit, OnChanges {
  /** Root/country office id to fetch regions from. */
  countryId: number | null = null;

  /** Emits the current region/district/site selection whenever it changes. */
  @Output() selectionChange = new EventEmitter<SiteSelectorChange>();

  siteSelectorForm: UntypedFormGroup;

  regionOptions: any[] = [];
  districtOptions: any[] = [];
  siteOptions: any[] = [];

  /** Sentinel value representing the "All Sites" option (no specific sites selected). */
  readonly ALL_SITES: number[] | null = null;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private organizationService: OrganizationService,
    private settingsService: SettingsService
  ) {
    this.siteSelectorForm = this.formBuilder.group({
      regionId: [null],
      districtId: [null],
      siteIds: [this.ALL_SITES],
    });
  }

  ngOnInit(): void {
    this.countryId = this.settingsService.getSelectedCountry()?.id;
    if (this.countryId) {
      this.loadRegions();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['countryId'] && !changes['countryId'].firstChange) {
      this.resetForm();
      this.loadRegions();
    }
  }

  private resetForm(): void {
    this.regionOptions = [];
    this.districtOptions = [];
    this.siteOptions = [];
    this.siteSelectorForm.reset({ regionId: null, districtId: null, siteIds: this.ALL_SITES });
    this.emitSelection();
  }

  private loadRegions(): void {
    if (!this.countryId) {
      return;
    }
    this.organizationService.fetchByHierarchyLevel(this.countryId, 'LOWER').subscribe((response: any) => {
      this.regionOptions = (response || []).filter((office: any) => office.status === true);
    });
  }

  onRegionChange(region: any): void {
    this.districtOptions = [];
    this.siteOptions = [];
    this.siteSelectorForm.patchValue({ districtId: null, siteIds: this.ALL_SITES });

    if (region?.id) {
      this.organizationService.fetchByHierarchyLevel(region.id, 'LOWER').subscribe((response: any) => {
        this.districtOptions = (response || []).filter((office: any) => office.status === true);
      });
    }
    this.emitSelection();
  }

  onDistrictChange(district: any): void {
    this.siteOptions = [];
    this.siteSelectorForm.patchValue({ siteIds: this.ALL_SITES });

    if (district?.id) {
      this.organizationService.fetchByHierarchyLevel(district.id, 'LOWER').subscribe((response: any) => {
        this.siteOptions = (response || []).filter((office: any) => office.status === true);
      });
    }
    this.emitSelection();
  }

  onSiteChange(): void {
    this.emitSelection();
  }

  /** Site option objects for the currently selected site ids. */
  get selectedSites(): any[] {
    const siteIds: number[] = this.siteSelectorForm.value.siteIds || [];
    return this.siteOptions.filter((site: any) => siteIds.includes(site.id));
  }

  /** Removes a single site from the current selection. */
  removeSite(siteId: number): void {
    const siteIds: number[] = this.siteSelectorForm.value.siteIds || [];
    const updated = siteIds.filter((id: number) => id !== siteId);
    this.siteSelectorForm.patchValue({ siteIds: updated.length ? updated : this.ALL_SITES });
    this.emitSelection();
  }

  private emitSelection(): void {
    const value = this.siteSelectorForm.value;
    const region = this.regionOptions.find((office: any) => office.id === value.regionId);
    const district = this.districtOptions.find((office: any) => office.id === value.districtId);
    this.selectionChange.emit({
      regionId: value.regionId ?? null,
      regionName: region?.name ?? null,
      districtId: value.districtId ?? null,
      districtName: district?.name ?? null,
      siteIds: value.siteIds?.length ? value.siteIds : null,
    });
  }
}
