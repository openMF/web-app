/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  inject,
  Input,
  OnChanges,
  OnDestroy,
  ViewChild
} from '@angular/core';
import * as L from 'leaflet';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';
import { getCoordinatePair } from 'app/clients/utils/address-coordinate.util';
import { ADDRESS_LOCATION_MAP_TILE_ATTRIBUTION, ADDRESS_LOCATION_MAP_TILE_URL } from './address-location-map.constants';

/**
 * Customer address location map.
 */
@Component({
  selector: 'mifosx-address-location-map',
  templateUrl: './address-location-map.component.html',
  styleUrls: ['./address-location-map.component.scss'],
  imports: [...STANDALONE_SHARED_IMPORTS],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressLocationMapComponent implements AfterViewInit, OnChanges, OnDestroy {
  private changeDetectorRef = inject(ChangeDetectorRef);

  @Input() latitude: string | number | null | undefined;
  @Input() longitude: string | number | null | undefined;

  @ViewChild('mapContainer')
  set mapContainer(container: ElementRef<HTMLElement> | undefined) {
    this.mapContainerElement = container;
    this.updateMap();
  }

  private readonly zoom = 15;
  private map: L.Map | null = null;
  private marker: L.Marker | null = null;
  private mapContainerElement?: ElementRef<HTMLElement>;
  tileLoadFailed = false;

  private readonly markerIcon = L.icon({
    iconRetinaUrl: 'assets/leaflet/marker-icon-2x.png',
    iconUrl: 'assets/leaflet/marker-icon.png',
    shadowUrl: 'assets/leaflet/marker-shadow.png',
    iconSize: [
      25,
      41
    ],
    iconAnchor: [
      12,
      41
    ],
    popupAnchor: [
      1,
      -34
    ],
    shadowSize: [
      41,
      41
    ]
  });

  ngAfterViewInit(): void {
    this.updateMap();
  }

  ngOnChanges(): void {
    this.updateMap();
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  get hasValidCoordinates(): boolean {
    return this.getCoordinatePair() !== null;
  }

  private updateMap(): void {
    const coordinates = this.getCoordinatePair();
    if (!coordinates) {
      this.destroyMap();
      return;
    }

    if (!this.mapContainerElement) {
      return;
    }

    if (!this.map) {
      this.tileLoadFailed = false;
      this.map = L.map(this.mapContainerElement.nativeElement).setView(coordinates, this.zoom);
      L.tileLayer(ADDRESS_LOCATION_MAP_TILE_URL, {
        attribution: ADDRESS_LOCATION_MAP_TILE_ATTRIBUTION
      })
        .on('tileerror', () => {
          this.tileLoadFailed = true;
          this.changeDetectorRef.markForCheck();
        })
        .addTo(this.map);
      this.marker = L.marker(coordinates, { icon: this.markerIcon }).addTo(this.map);
    } else {
      this.map.setView(coordinates, this.zoom);
      this.marker?.setLatLng(coordinates);
    }

    setTimeout(() => this.map?.invalidateSize(), 0);
  }

  private getCoordinatePair(): L.LatLngTuple | null {
    return getCoordinatePair(this.latitude, this.longitude);
  }

  private destroyMap(): void {
    this.marker = null;
    this.map?.remove();
    this.map = null;
    this.tileLoadFailed = false;
  }
}
