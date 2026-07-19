/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import * as L from 'leaflet';

import { AddressLocationMapComponent } from './address-location-map.component';

const mockMapRemove = jest.fn();
const mockMapSetView = jest.fn().mockReturnThis();
const mockMapInvalidateSize = jest.fn();
const mockMarkerSetLatLng = jest.fn();
const mockTileLayerAddTo = jest.fn().mockReturnThis();
let mockTileErrorHandler: (() => void) | undefined;
const mockTileLayerOn = jest.fn().mockImplementation((_event: string, handler: () => void) => {
  mockTileErrorHandler = handler;
  return {
    addTo: mockTileLayerAddTo,
    on: mockTileLayerOn
  };
});
const mockMarkerAddTo = jest.fn().mockReturnThis();

jest.mock('leaflet', () => ({
  icon: jest.fn(() => ({})),
  map: jest.fn(() => ({
    setView: mockMapSetView,
    invalidateSize: mockMapInvalidateSize,
    remove: mockMapRemove
  })),
  tileLayer: jest.fn(() => ({
    addTo: mockTileLayerAddTo,
    on: mockTileLayerOn
  })),
  marker: jest.fn(() => ({
    addTo: mockMarkerAddTo,
    setLatLng: mockMarkerSetLatLng
  }))
}));

describe('AddressLocationMapComponent', () => {
  let component: AddressLocationMapComponent;
  let fixture: ComponentFixture<AddressLocationMapComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    mockTileErrorHandler = undefined;

    await TestBed.configureTestingModule({
      imports: [
        AddressLocationMapComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddressLocationMapComponent);
    component = fixture.componentInstance;
  });

  it('should initialize a map for valid coordinates', () => {
    component.latitude = 12.9716;
    component.longitude = 77.5946;

    fixture.detectChanges();

    expect(L.map).toHaveBeenCalledTimes(1);
    expect(L.tileLayer).toHaveBeenCalledTimes(1);
    expect(L.marker).toHaveBeenCalledWith(
      [
        12.9716,
        77.5946
      ],
      expect.any(Object)
    );
  });

  it('should not initialize without valid coordinates', () => {
    component.latitude = null;
    component.longitude = undefined;

    fixture.detectChanges();

    expect(L.map).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.address-location-map')).toBeNull();
  });

  it('should destroy the map instance on cleanup', () => {
    component.latitude = 12.9716;
    component.longitude = 77.5946;
    fixture.detectChanges();

    component.ngOnDestroy();

    expect(mockMapRemove).toHaveBeenCalledTimes(1);
  });

  it('should not initialize duplicate map instances', () => {
    component.latitude = 12.9716;
    component.longitude = 77.5946;
    fixture.detectChanges();

    fixture.componentRef.setInput('latitude', 13);
    fixture.componentRef.setInput('longitude', 78);
    fixture.detectChanges();

    expect(L.map).toHaveBeenCalledTimes(1);
    expect(mockMarkerSetLatLng).toHaveBeenCalledWith([
      13,
      78
    ]);
  });

  it('should preserve zero values as valid coordinates', () => {
    component.latitude = 0;
    component.longitude = '0';

    fixture.detectChanges();

    expect(L.map).toHaveBeenCalledTimes(1);
    expect(L.marker).toHaveBeenCalledWith(
      [
        0,
        0
      ],
      expect.any(Object)
    );
  });

  it('should parse exponential zero values as valid coordinates', () => {
    component.latitude = '0E-8';
    component.longitude = '0E-8';

    fixture.detectChanges();

    expect(L.map).toHaveBeenCalledTimes(1);
    expect(L.marker).toHaveBeenCalledWith(
      [
        0,
        0
      ],
      expect.any(Object)
    );
  });

  it('should not initialize for out-of-range coordinates', () => {
    component.latitude = 91;
    component.longitude = 181;

    fixture.detectChanges();

    expect(L.map).not.toHaveBeenCalled();
  });

  it('should show a compact tile loading failure message', () => {
    component.latitude = 12.9716;
    component.longitude = 77.5946;
    fixture.detectChanges();

    mockTileErrorHandler?.();
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('labels.text.Map tiles unavailable');
  });
});
