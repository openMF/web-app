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
  ChangeDetectorRef,
  Component,
  DestroyRef,
  OnInit,
  Input,
  inject
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormGroup, ValidatorFn } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

/** Angular Material Imports */
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatButtonToggle, MatButtonToggleGroup } from '@angular/material/button-toggle';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';

/** rxjs Imports */
import { forkJoin, of, Subscription, Subject } from 'rxjs';
import { map, catchError, debounceTime, distinctUntilChanged, finalize, switchMap, takeUntil } from 'rxjs/operators';

/** Custom Components */
import { faMapMarkerAlt, faEllipsisH } from '@fortawesome/free-solid-svg-icons';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DeleteDialogComponent } from 'app/shared/delete-dialog/delete-dialog.component';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { AddressLocationMapComponent } from 'app/clients/clients-view/address-tab/address-location-map/address-location-map.component';

/** Custom Services */
import { TranslateService } from '@ngx-translate/core';
import { ClientsService } from 'app/clients/clients.service';
import { OrganizationService } from 'app/organization/organization.service';
import { PostalCodeLookupService } from 'app/shared/services/postal-code-lookup.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { environment } from 'environments/environment';

/** Custom Models */
import { FormfieldBase } from 'app/shared/form-dialog/formfield/model/formfield-base';
import { InputBase } from 'app/shared/form-dialog/formfield/model/input-base';
import { SelectBase } from 'app/shared/form-dialog/formfield/model/select-base';
import { CheckboxBase } from 'app/shared/form-dialog/formfield/model/checkbox-base';
import { ResolvedAddress } from 'app/shared/models/postal-code-lookup.model';
import { OfficeAddress } from './office-address.model';

/** Custom Imports */
import { Clipboard } from '@angular/cdk/clipboard';
import { AlertService } from 'app/core/alert/alert.service';
import { OfficeDetailsSummary } from '../office-details-summary';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { CoordinateType, hasValidCoordinatePair, parseCoordinate } from 'app/clients/utils/address-coordinate.util';

type AddressFilter = 'all' | 'active' | 'inactive';

@Component({
  selector: 'mifosx-office-address-tab',
  templateUrl: './address-tab.component.html',
  styleUrls: ['./address-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    FaIconComponent,
    MatProgressSpinner,
    MatButtonToggle,
    MatButtonToggleGroup,
    MatMenu,
    MatMenuItem,
    MatMenuTrigger,
    AddressLocationMapComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressTabComponent implements OnInit {
  @Input() readOnly = false;

  readonly pinIcon = faMapMarkerAlt;
  readonly moreIcon = faEllipsisH;
  readonly hasValidCoordinatePair = hasValidCoordinatePair;

  private summary = inject(OfficeDetailsSummary, { optional: true });
  private clipboard = inject(Clipboard);
  private alertService = inject(AlertService);
  private authenticationService = inject(AuthenticationService);
  private route = inject(ActivatedRoute);
  private organizationService = inject(OrganizationService);
  private clientsService = inject(ClientsService);
  private dialog = inject(MatDialog);
  private translateService = inject(TranslateService);
  private postalCodeLookup = inject(PostalCodeLookupService);
  private changeDetectorRef = inject(ChangeDetectorRef);
  private destroyRef = inject(DestroyRef);

  private readonly officeChanged = new Subject<void>();
  private loadRequest?: Subscription;

  selectedFilter: AddressFilter = 'all';
  selectedAddressId: string | null = null;
  readonly filters: { value: AddressFilter; label: string }[] = [
    { value: 'all', label: 'labels.inputs.All' },
    { value: 'active', label: 'labels.inputs.Active' },
    { value: 'inactive', label: 'labels.catalogs.Inactive' }
  ];
  readonly addressFields = [
    { key: 'street', label: 'labels.inputs.Street' },
    { key: 'addressLine1', label: 'labels.inputs.Address Line 1' },
    { key: 'addressLine2', label: 'labels.inputs.Address Line 2' },
    { key: 'addressLine3', label: 'labels.inputs.Address Line 3' },
    { key: 'townVillage', label: 'labels.inputs.Town / Village' }
  ] as const;
  readonly localityFields = [
    { key: 'city', label: 'labels.inputs.City', options: '' },
    { key: 'countyDistrict', label: 'labels.inputs.County / District', options: '' },
    { key: 'stateProvinceId', label: 'labels.inputs.State / Province', options: 'stateProvinceIdOptions' },
    { key: 'countryId', label: 'labels.inputs.Country', options: 'countryIdOptions' },
    { key: 'postalCode', label: 'labels.inputs.Postal Code', options: '' }
  ] as const;

  get officeName(): string {
    return this.route.parent.snapshot.data?.['office']?.name ?? '';
  }

  get visibleAddresses(): OfficeAddress[] {
    return this.officeAddresses.filter((address) => this.matchesFilter(address, this.selectedFilter));
  }

  get selectedAddress(): OfficeAddress | null {
    return this.visibleAddresses.find((address) => this.addressKey(address) === this.selectedAddressId) ?? null;
  }

  filterCount(filter: AddressFilter): number {
    return this.officeAddresses.filter((address) => this.matchesFilter(address, filter)).length;
  }

  setFilter(filter: AddressFilter): void {
    if (!this.filters.some((entry) => entry.value === filter)) return;
    this.selectedFilter = filter;
    this.reconcileSelection(this.selectedAddressId, 0);
  }

  selectAddress(address: OfficeAddress): void {
    if (this.visibleAddresses.includes(address)) this.selectedAddressId = this.addressKey(address);
  }

  addressKey(address: OfficeAddress): string {
    return this.getOfficeAddressId(address, this.officeAddresses.indexOf(address));
  }

  private matchesFilter(address: OfficeAddress, filter: AddressFilter): boolean {
    return filter === 'all' || address.isActive === (filter === 'active');
  }

  private reconcileSelection(preferredId = this.selectedAddressId, nextIndex?: number): void {
    const visible = this.visibleAddresses;
    const retained = visible.find((address) => this.addressKey(address) === preferredId);
    const fallback =
      nextIndex === undefined
        ? ((preferredId === null ? visible.find((address) => address.isActive === true) : null) ?? visible[0])
        : visible[Math.min(nextIndex, visible.length - 1)];
    const selected = retained ?? fallback;
    this.selectedAddressId = selected ? this.addressKey(selected) : null;
  }

  officeId: string;
  officeAddresses: OfficeAddress[] = [];
  addressTemplate: any = {
    addressTypeIdOptions: [],
    stateProvinceIdOptions: [],
    countryIdOptions: []
  };
  isLoading = true;
  isSaving = false;
  hasError = false;
  isPluginUnavailable = false;
  optionsLoadFailed = false;

  private autoFilledFields = new Set<string>();
  private readonly coordinateDecimals = 13;

  get hasOfficeAddress(): boolean {
    return this.officeAddresses.length > 0;
  }

  get canAddAddress(): boolean {
    return (
      this.canManageAddress('CREATE_OFFICE') &&
      !this.hasOfficeAddress &&
      !this.isLoading &&
      !this.isSaving &&
      !this.hasError &&
      !this.optionsLoadFailed &&
      !this.isPluginUnavailable
    );
  }

  ngOnInit() {
    this.route.parent.paramMap
      .pipe(
        map((params) => params.get('officeId') ?? ''),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((officeId) => {
        this.officeChanged.next();
        this.officeId = officeId;
        this.officeAddresses = [];
        this.selectedAddressId = null;
        this.selectedFilter = 'all';
        this.addressTemplate = { addressTypeIdOptions: [], stateProvinceIdOptions: [], countryIdOptions: [] };
        this.isSaving = false;
        this.loadOfficeAddresses();
        this.changeDetectorRef.markForCheck();
      });
  }

  loadOfficeAddresses(preferredId = this.selectedAddressId, nextIndex?: number) {
    this.loadRequest?.unsubscribe();
    this.summary?.addressCount.set(null);
    this.summary?.location.set('');
    this.isLoading = true;
    this.hasError = false;
    this.isPluginUnavailable = false;
    this.optionsLoadFailed = false;

    this.loadRequest = forkJoin({
      addresses: this.organizationService.getOfficeAddresses(this.officeId).pipe(
        catchError((error) => {
          if (this.isEndpointNotFound(error)) {
            this.isPluginUnavailable = true;
          } else {
            this.hasError = true;
          }
          return of([]);
        })
      ),
      template: this.clientsService.getClientAddressTemplate().pipe(
        catchError(() => {
          this.optionsLoadFailed = true;
          return of(this.addressTemplate);
        })
      )
    })
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(({ addresses, template }: { addresses: (OfficeAddress | null)[] | null; template: any }) => {
        this.officeAddresses = Array.isArray(addresses)
          ? addresses.filter((address): address is OfficeAddress => !!address && typeof address === 'object')
          : [];
        this.addressTemplate = {
          ...this.addressTemplate,
          ...template
        };
        this.translateAddressTypes();
        this.reconcileSelection(preferredId, nextIndex);
        if (!this.hasError && !this.isPluginUnavailable && Array.isArray(addresses)) {
          this.summary?.addressCount.set(this.officeAddresses.length);
          const address = this.officeAddresses.find((entry) => entry.isActive === true) ?? this.officeAddresses[0];
          if (address) {
            this.summary?.location.set(
              this.uniqueAddressParts([
                address.city,
                this.getSelectedValue('stateProvinceIdOptions', address.stateProvinceId)?.name
              ]).join(', ')
            );
          }
        }
      });
  }

  addAddress() {
    if (!this.canAddAddress) {
      return;
    }

    const data = {
      title:
        this.translateService.instant('labels.buttons.Add') +
        ' ' +
        this.translateService.instant('labels.inputs.Office') +
        ' ' +
        this.translateService.instant('labels.heading.Address'),
      formfields: this.getAddressFormFields(),
      layout: { addButtonText: 'labels.buttons.Submit' }
    };
    const addAddressDialogRef = this.dialog.open(FormDialogComponent, { data });
    this.setupCoordinateValidation(addAddressDialogRef);
    this.setupPostalCodeLookup(addAddressDialogRef);
    addAddressDialogRef
      .afterClosed()
      .pipe(takeUntil(this.officeChanged), takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response?.data && this.canAddAddress && this.isValidLocationInput(response.data.value)) {
          this.saveAddress(
            this.organizationService.createOfficeAddress(this.officeId, this.normalizeAddressData(response.data.value)),
            { created: true }
          );
        }
      });
  }

  editAddress(address: OfficeAddress) {
    if (
      !this.canManageAddress('UPDATE_OFFICE') ||
      this.isLoading ||
      this.isSaving ||
      this.optionsLoadFailed ||
      this.isPluginUnavailable
    ) {
      return;
    }

    const officeAddressId = this.getOfficeAddressId(address);
    if (!officeAddressId) {
      return;
    }

    const data = {
      title:
        this.translateService.instant('labels.buttons.Edit') +
        ' ' +
        this.translateService.instant('labels.inputs.Office') +
        ' ' +
        this.translateService.instant('labels.heading.Address'),
      formfields: this.getAddressFormFields(address),
      layout: { addButtonText: 'labels.buttons.Edit' }
    };
    const editAddressDialogRef = this.dialog.open(FormDialogComponent, { data });
    this.setupCoordinateValidation(editAddressDialogRef);
    this.setupPostalCodeLookup(editAddressDialogRef);
    editAddressDialogRef
      .afterClosed()
      .pipe(takeUntil(this.officeChanged), takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (
          response?.data &&
          !this.isSaving &&
          !this.isLoading &&
          this.canManageAddress('UPDATE_OFFICE') &&
          this.isValidLocationInput(response.data.value)
        ) {
          this.saveAddress(
            this.organizationService.updateOfficeAddress(
              this.officeId,
              officeAddressId,
              this.normalizeAddressData(response.data.value)
            )
          );
        }
      });
  }

  deleteAddress(address: OfficeAddress) {
    if (!this.canManageAddress('DELETE_OFFICE') || this.isLoading || this.isSaving || this.isPluginUnavailable) {
      return;
    }

    const officeAddressId = this.getOfficeAddressId(address);
    if (!officeAddressId) {
      return;
    }

    const deleteAddressDialogRef = this.dialog.open(DeleteDialogComponent, {
      data: { deleteContext: this.translateService.instant('labels.heading.Address') }
    });
    deleteAddressDialogRef
      .afterClosed()
      .pipe(takeUntil(this.officeChanged), takeUntilDestroyed(this.destroyRef))
      .subscribe((response: any) => {
        if (response?.delete && !this.isSaving && !this.isLoading && this.canManageAddress('DELETE_OFFICE')) {
          this.saveAddress(this.organizationService.deleteOfficeAddress(this.officeId, officeAddressId), {
            nextIndex: this.visibleAddresses.indexOf(address)
          });
        }
      });
  }

  toggleAddress(address: OfficeAddress) {
    if (!this.canManageAddress('UPDATE_OFFICE') || this.isLoading || this.isSaving || this.isPluginUnavailable) {
      return;
    }

    const officeAddressId = this.getOfficeAddressId(address);
    if (!officeAddressId) {
      return;
    }

    this.saveAddress(
      this.organizationService.updateOfficeAddress(this.officeId, officeAddressId, {
        isActive: !address.isActive
      })
    );
  }

  getSelectedValue(fieldName: string, fieldId: any) {
    return this.addressTemplate[fieldName]?.find((fieldObj: any) => fieldObj.id === fieldId);
  }

  getAddressType(address: OfficeAddress): string {
    return (
      this.getSelectedValue('addressTypeIdOptions', address.addressTypeId)?.name ?? String(address.addressTypeId ?? '')
    );
  }

  hasValue(value: any): boolean {
    return value !== null && value !== undefined && value !== '';
  }

  private uniqueAddressParts(values: unknown[]): string[] {
    const seen = new Set<string>();
    return values
      .filter((value): value is string => typeof value === 'string')
      .map((value) => value.trim())
      .filter((value) => {
        const key = value.toLocaleLowerCase();
        if (!value || seen.has(key)) {
          return false;
        }
        seen.add(key);
        return true;
      });
  }

  getPostalLines(address: OfficeAddress): string[] {
    const lines = this.uniqueAddressParts([
      address.street,
      address.addressLine1,
      address.addressLine2,
      address.addressLine3,
      address.townVillage,
      address.countyDistrict,
      address.city,
      this.getSelectedValue('stateProvinceIdOptions', address.stateProvinceId)?.name,
      address.postalCode,
      this.getSelectedValue('countryIdOptions', address.countryId)?.name
    ]);
    return lines.length > 1 ? [
          lines[0],
          lines.slice(1).join(', ')
        ] : lines;
  }

  getMapUrl(address: OfficeAddress): string | null {
    if (!hasValidCoordinatePair(address.latitude, address.longitude)) {
      return null;
    }
    const latitude = encodeURIComponent(String(address.latitude).trim());
    const longitude = encodeURIComponent(String(address.longitude).trim());
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;
  }

  copyCoordinates(address: OfficeAddress) {
    if (!hasValidCoordinatePair(address.latitude, address.longitude)) {
      return;
    }
    const value = `${String(address.latitude).trim()}, ${String(address.longitude).trim()}`;
    const copied = this.clipboard.copy(value);
    this.alertService.alert({
      type: this.translateService.instant('errors.clipboard.type'),
      message: this.translateService.instant(copied ? 'errors.clipboard.copied' : 'errors.clipboard.copyFailed', {
        value
      })
    });
  }

  private saveAddress(request: any, selection: { created?: boolean; nextIndex?: number } = {}) {
    this.isSaving = true;
    this.hasError = false;
    this.isPluginUnavailable = false;
    request
      .pipe(
        finalize(() => {
          this.isSaving = false;
          this.changeDetectorRef.markForCheck();
        }),
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (response: any) => {
          if (selection.created) this.selectedFilter = 'all';
          const preferredId =
            selection.created && response?.entityId != null ? String(response.entityId) : this.selectedAddressId;
          this.loadOfficeAddresses(preferredId, selection.nextIndex);
        },
        error: (error: any) => {
          if (this.isEndpointNotFound(error)) {
            this.isPluginUnavailable = true;
            this.officeAddresses = [];
          } else {
            this.hasError = true;
          }
          this.changeDetectorRef.markForCheck();
        }
      });
  }

  private isEndpointNotFound(error: any): boolean {
    return error?.status === 404 && error?.error?.error === 'Not Found';
  }

  getActiveStatusLabel(isActive: unknown): string {
    return isActive === true
      ? 'labels.inputs.Active'
      : isActive === false
        ? 'labels.catalogs.Inactive'
        : 'labels.inputs.Not Provided';
  }

  getOfficeAddressId(address: OfficeAddress | null | undefined, index?: number): string {
    const officeAddressId = address?.officeAddressId ?? address?.id ?? address?.addressId;
    if (officeAddressId === null || officeAddressId === undefined) {
      return index === undefined ? '' : `office-address-${index}`;
    }
    return officeAddressId.toString();
  }

  private normalizeAddressData(addressData: any) {
    const normalizedAddressData: any = {
      addressTypeId: addressData.addressTypeId,
      street: addressData.street ?? '',
      addressLine1: addressData.addressLine1 ?? '',
      addressLine2: addressData.addressLine2 ?? '',
      addressLine3: addressData.addressLine3 ?? '',
      townVillage: addressData.townVillage ?? '',
      city: addressData.city ?? '',
      countyDistrict: addressData.countyDistrict ?? '',
      stateProvinceId: addressData.stateProvinceId || null,
      countryId: addressData.countryId || null,
      postalCode: addressData.postalCode ?? '',
      isActive: !!addressData.isActive
    };

    // Omitted coordinates mean unchanged; explicit empty values deliberately clear the pair.
    if (addressData.latitude !== undefined && addressData.longitude !== undefined) {
      // Fineract's locale-based string parser needs decimal notation; expand exponents without rounding.
      normalizedAddressData.locale = 'en';
      normalizedAddressData.latitude = this.hasValue(addressData.latitude)
        ? this.serializeCoordinate(addressData.latitude)
        : null;
      normalizedAddressData.longitude = this.hasValue(addressData.longitude)
        ? this.serializeCoordinate(addressData.longitude)
        : null;
    }

    return normalizedAddressData;
  }

  private serializeCoordinate(value: string | number): string | number {
    if (typeof value !== 'string') {
      return value;
    }

    const match = /^([+-]?)(\d*)(?:\.(\d*))?[eE]([+-]?\d+)$/.exec(value.trim());
    if (!match || !Number.isFinite(Number(value))) {
      return value;
    }
    // Zero needs no exponent expansion; nonzero underflow is rejected by precision validation.
    if (Number(value) === 0) {
      return '0';
    }

    const [
      ,
      sign,
      integer,
      fraction = '',
      exponent
    ] = match;
    const digits = integer + fraction;
    const decimalPosition = integer.length + Number(exponent);
    const prefix = sign === '-' ? '-' : '';
    if (decimalPosition <= 0) {
      return `${prefix}0.${'0'.repeat(-decimalPosition)}${digits}`;
    }
    if (decimalPosition >= digits.length) {
      return `${prefix}${digits}${'0'.repeat(decimalPosition - digits.length)}`;
    }
    return `${prefix}${digits.slice(0, decimalPosition)}.${digits.slice(decimalPosition)}`;
  }

  private getAddressFormFields(address?: OfficeAddress) {
    const formfields: FormfieldBase[] = [
      new SelectBase({
        controlName: 'addressTypeId',
        label: this.translateService.instant('labels.inputs.Address Type'),
        value: address ? address.addressTypeId : '',
        options: { label: 'name', value: 'id', data: this.addressTemplate.addressTypeIdOptions ?? [] },
        required: true,
        order: 1
      }),
      new InputBase({
        controlName: 'postalCode',
        label: this.translateService.instant('labels.inputs.Postal Code'),
        value: address ? address.postalCode : '',
        type: 'text',
        order: 2
      }),
      new InputBase({
        controlName: 'street',
        label: this.translateService.instant('labels.inputs.Street'),
        value: address ? address.street : '',
        type: 'text',
        order: 3
      }),
      new InputBase({
        controlName: 'addressLine1',
        label: this.translateService.instant('labels.inputs.Address Line 1'),
        value: address ? address.addressLine1 : '',
        type: 'text',
        order: 4
      }),
      new InputBase({
        controlName: 'addressLine2',
        label: this.translateService.instant('labels.inputs.Address Line 2'),
        value: address ? address.addressLine2 : '',
        type: 'text',
        order: 5
      }),
      new InputBase({
        controlName: 'addressLine3',
        label: this.translateService.instant('labels.inputs.Address Line 3'),
        value: address ? address.addressLine3 : '',
        type: 'text',
        order: 6
      }),
      new InputBase({
        controlName: 'townVillage',
        label: this.translateService.instant('labels.inputs.Town / Village'),
        value: address ? address.townVillage : '',
        type: 'text',
        order: 7
      }),
      new InputBase({
        controlName: 'city',
        label: this.translateService.instant('labels.inputs.City'),
        value: address ? address.city : '',
        type: 'text',
        order: 8
      }),
      new SelectBase({
        controlName: 'stateProvinceId',
        label: this.translateService.instant('labels.inputs.State / Province'),
        value: address ? address.stateProvinceId : '',
        options: { label: 'name', value: 'id', data: this.addressTemplate.stateProvinceIdOptions ?? [] },
        order: 9
      }),
      new InputBase({
        controlName: 'countyDistrict',
        label: this.translateService.instant('labels.inputs.Country District'),
        value: address ? address.countyDistrict : '',
        type: 'text',
        order: 10
      }),
      new SelectBase({
        controlName: 'countryId',
        label: this.translateService.instant('labels.inputs.Country'),
        value: address ? address.countryId : '',
        options: { label: 'name', value: 'id', data: this.addressTemplate.countryIdOptions ?? [] },
        order: 11
      }),
      new InputBase({
        controlName: 'latitude',
        label: this.translateService.instant('labels.inputs.Latitude'),
        value: address?.latitude == null ? '' : String(address.latitude),
        type: 'text',
        inputmode: 'decimal',
        min: -90,
        max: 90,
        validators: [this.coordinateValidator('latitude')],
        order: 12
      }),
      new InputBase({
        controlName: 'longitude',
        label: this.translateService.instant('labels.inputs.Longitude'),
        value: address?.longitude == null ? '' : String(address.longitude),
        type: 'text',
        inputmode: 'decimal',
        min: -180,
        max: 180,
        validators: [this.coordinateValidator('longitude')],
        order: 13
      }),
      new CheckboxBase({
        controlName: 'isActive',
        label: this.translateService.instant('labels.inputs.Active Status'),
        value: address ? address.isActive : true,
        order: 14
      })
    ];
    return formfields;
  }

  canManageAddress(permission: 'CREATE_OFFICE' | 'UPDATE_OFFICE' | 'DELETE_OFFICE'): boolean {
    if (this.readOnly) {
      return false;
    }
    if (!environment.productionModeEnableRBAC) {
      return true;
    }
    const permissions = this.authenticationService.getCredentials()?.permissions ?? [];
    return permissions.includes('ALL_FUNCTIONS') || permissions.includes(permission);
  }

  private coordinateValidator(type: CoordinateType): ValidatorFn {
    return (control) => {
      const other = control.parent?.get(type === 'latitude' ? 'longitude' : 'latitude');
      if (!this.hasValue(control.value)) {
        return this.hasValue(other?.value) ? { required: true } : null;
      }
      if (parseCoordinate(control.value, type) === null) {
        return { invalidNumber: true };
      }
      return this.hasCoordinatePrecision(control.value) ? null : { maxDecimals: { decimals: this.coordinateDecimals } };
    };
  }

  private hasCoordinatePrecision(value: string | number): boolean {
    const match = /^[+-]?(\d*)(?:\.(\d*))?(?:[eE]([+-]?\d+))?$/.exec(String(value).trim());
    if (!match) {
      return false;
    }
    const integer = match[1];
    const fraction = match[2] ?? '';
    const exponent = Number(match[3] ?? 0);
    const significantDigits = (integer + fraction).replace(/0+$/, '');
    // Count the expanded fractional digits without allocating an exponent-sized string or rounding.
    return (
      significantDigits.length === 0 || significantDigits.length - integer.length - exponent <= this.coordinateDecimals
    );
  }

  private isValidLocationInput(data: any): boolean {
    return (
      (!this.hasValue(data.latitude) && !this.hasValue(data.longitude)) ||
      (hasValidCoordinatePair(data.latitude, data.longitude) &&
        this.hasCoordinatePrecision(data.latitude) &&
        this.hasCoordinatePrecision(data.longitude))
    );
  }

  private setupCoordinateValidation(dialogRef: MatDialogRef<FormDialogComponent>) {
    dialogRef.afterOpened().subscribe(() => {
      const form = dialogRef.componentInstance.form;
      const validatePair = () => {
        form.get('latitude')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        form.get('longitude')?.updateValueAndValidity({ onlySelf: true, emitEvent: false });
        form.updateValueAndValidity({ emitEvent: false });
      };
      validatePair();
      form.valueChanges
        .pipe(takeUntil(dialogRef.afterClosed()), takeUntilDestroyed(this.destroyRef))
        .subscribe(validatePair);
    });
  }

  private translateAddressTypes() {
    this.addressTemplate.addressTypeIdOptions = (this.addressTemplate.addressTypeIdOptions ?? []).map(
      (option: any) => ({
        ...option,
        name: this.translateCatalogValue(option.name)
      })
    );
  }

  private translateCatalogValue(value: string): string {
    const translationKey = `labels.catalogs.${value}`;
    const translatedValue = this.translateService.instant(translationKey);
    return translatedValue === translationKey ? value : translatedValue;
  }

  private setupPostalCodeLookup(dialogRef: MatDialogRef<FormDialogComponent>) {
    if (!this.postalCodeLookup.enabled) return;

    let postalSub: Subscription;
    dialogRef
      .afterOpened()
      .pipe(takeUntil(dialogRef.afterClosed()), takeUntil(this.officeChanged), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        const form: FormGroup = dialogRef.componentInstance.form;
        const postalCodeControl = form.get('postalCode');
        if (!postalCodeControl) return;

        const initialCountryId = form.get('countryId')?.value || null;
        postalSub = postalCodeControl.valueChanges
          .pipe(
            debounceTime(600),
            distinctUntilChanged(),
            switchMap((value: string) => {
              if (!value || value.trim().length < 3) {
                return of(null);
              }
              const postalCode = value.trim();
              const currentCountryId = form.get('countryId')?.value;
              const isUserSelectedCountry =
                currentCountryId && (currentCountryId === initialCountryId || !this.autoFilledFields.has('countryId'));

              if (isUserSelectedCountry) {
                const countryCode = this.getSelectedCountryCode(form);
                if (countryCode) {
                  return this.postalCodeLookup.lookup(countryCode, postalCode);
                }
              }
              return this.postalCodeLookup.lookupWithFallback(postalCode);
            })
          )
          .subscribe((response) => {
            if (!response) {
              this.clearAutoFilledFields(form);
              return;
            }
            const resolved = this.postalCodeLookup.toResolvedAddress(response);
            if (resolved) {
              this.clearAutoFilledFields(form);
              this.applyResolvedAddress(form, resolved);
            } else {
              this.clearAutoFilledFields(form);
            }
          });
      });

    dialogRef
      .afterClosed()
      .pipe(
        takeUntil(this.officeChanged),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          postalSub?.unsubscribe();
          this.autoFilledFields.clear();
        })
      )
      .subscribe();
  }

  private getSelectedCountryCode(form: FormGroup): string | null {
    const countryIdValue = form.get('countryId')?.value;
    if (!countryIdValue) return null;

    const selectedCountry = this.addressTemplate.countryIdOptions?.find(
      (country: any) => country.id === countryIdValue
    );
    if (!selectedCountry) return null;

    return this.postalCodeLookup.resolveCountryCode(selectedCountry.name);
  }

  private clearAutoFilledFields(form: FormGroup) {
    for (const fieldName of this.autoFilledFields) {
      const control = form.get(fieldName);
      if (control) {
        control.setValue('');
        control.markAsDirty();
      }
    }
    this.autoFilledFields.clear();
  }

  private applyResolvedAddress(form: FormGroup, address: ResolvedAddress) {
    const cityControl = form.get('city');
    if (cityControl && address.city) {
      cityControl.setValue(address.city);
      cityControl.markAsDirty();
      this.autoFilledFields.add('city');
    }

    const stateControl = form.get('stateProvinceId');
    if (stateControl && (address.state || address.stateAbbreviation)) {
      const matched = this.postalCodeLookup.findBestMatch(
        this.addressTemplate.stateProvinceIdOptions ?? [],
        address.state,
        address.stateAbbreviation
      );
      if (matched) {
        stateControl.setValue(matched.id);
        stateControl.markAsDirty();
        this.autoFilledFields.add('stateProvinceId');
      }
    }

    const countryControl = form.get('countryId');
    if (countryControl && (address.country || address.countryAbbreviation)) {
      const matched = this.postalCodeLookup.findBestMatch(
        this.addressTemplate.countryIdOptions ?? [],
        address.country,
        address.countryAbbreviation
      );
      if (matched) {
        countryControl.setValue(matched.id);
        countryControl.markAsDirty();
        this.autoFilledFields.add('countryId');
      }
    }

    form.markAsDirty();
  }
}
