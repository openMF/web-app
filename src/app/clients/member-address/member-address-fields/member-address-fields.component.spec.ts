/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { beforeEach, describe, expect, it } from '@jest/globals';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

import { MemberAddressForm, createMemberAddressForm, patchMemberAddressForm } from '../member-address-form';
import { NepalLocationIndex } from '../nepal-location-index';
import { MOCK_LOCATIONS, mockAddress } from '../testing/nepal-locations.mock';
import { MemberAddressFieldsComponent } from './member-address-fields.component';

describe('MemberAddressFieldsComponent', () => {
  let fixture: ComponentFixture<MemberAddressFieldsComponent>;
  let component: MemberAddressFieldsComponent;
  let form: MemberAddressForm;

  const create = async (prepare?: (f: MemberAddressForm) => void, savedLocalLevelCode: string | null = null) => {
    await TestBed.configureTestingModule({
      imports: [
        MemberAddressFieldsComponent,
        TranslateModule.forRoot()
      ],
      providers: [provideNoopAnimations()]
    }).compileComponents();

    form = createMemberAddressForm();
    prepare?.(form);
    fixture = TestBed.createComponent(MemberAddressFieldsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('form', form);
    fixture.componentRef.setInput('locations', new NepalLocationIndex(MOCK_LOCATIONS));
    fixture.componentRef.setInput('savedLocalLevelCode', savedLocalLevelCode);
    fixture.detectChanges();
  };

  describe('a new address', () => {
    beforeEach(() => create());

    it('starts with only the province open', () => {
      expect(form.controls.provinceCode.enabled).toBe(true);
      expect(form.controls.districtCode.disabled).toBe(true);
      expect(form.controls.localLevelCode.disabled).toBe(true);
      expect(form.controls.wardNo.disabled).toBe(true);
      expect(form.valid).toBe(false);
    });

    it('narrows each list by the choice above it and opens the next field', () => {
      form.controls.provinceCode.setValue('3');
      expect(component.districts().map((d) => d.code)).toEqual([
        '28',
        '27'
      ]);
      expect(form.controls.districtCode.enabled).toBe(true);

      form.controls.districtCode.setValue('27');
      expect(component.localLevels().map((l) => l.code)).toEqual([
        '32702',
        '32701'
      ]);
      expect(form.controls.localLevelCode.enabled).toBe(true);

      form.controls.localLevelCode.setValue('32702');
      expect(component.wards()).toHaveLength(13);
      expect(form.controls.wardNo.enabled).toBe(true);

      form.controls.wardNo.setValue(4);
      expect(form.valid).toBe(true);
    });

    it('filters a list by typing, in English or Nepali, anywhere in the name and in any case', () => {
      form.controls.provinceCode.setValue('3');
      const all = component.districts().length;
      const [first] = component.districts();

      component.districtSearch.setValue(first.nameEn.slice(1, 4).toUpperCase());
      expect(component.filteredDistricts().map((d) => d.code)).toContain(first.code);

      component.districtSearch.setValue(first.nameNp.slice(0, 2));
      expect(component.filteredDistricts().map((d) => d.code)).toContain(first.code);

      component.districtSearch.setValue('no such place');
      expect(component.filteredDistricts()).toEqual([]);

      component.districtSearch.setValue('');
      expect(component.filteredDistricts()).toHaveLength(all);
    });

    it('clears everything below a changed province or district', () => {
      form.controls.provinceCode.setValue('3');
      form.controls.districtCode.setValue('27');
      form.controls.localLevelCode.setValue('32701');
      form.controls.wardNo.setValue(20);

      form.controls.districtCode.setValue('28');
      expect(form.getRawValue()).toEqual(expect.objectContaining({ localLevelCode: null, wardNo: null }));
      expect(form.controls.wardNo.disabled).toBe(true);

      form.controls.localLevelCode.setValue('32801');
      form.controls.wardNo.setValue(2);
      form.controls.provinceCode.setValue('1');
      expect(form.getRawValue()).toEqual(
        expect.objectContaining({ provinceCode: '1', districtCode: null, localLevelCode: null, wardNo: null })
      );
      expect(component.localLevels()).toEqual([]);
    });

    it('keeps the ward when the new local level has it, and clears it when not', () => {
      form.controls.provinceCode.setValue('3');
      form.controls.districtCode.setValue('27');
      form.controls.localLevelCode.setValue('32701');
      form.controls.wardNo.setValue(5);

      form.controls.localLevelCode.setValue('32702');
      expect(form.controls.wardNo.value).toBe(5);

      form.controls.localLevelCode.setValue('32701');
      form.controls.wardNo.setValue(30);
      form.controls.localLevelCode.setValue('32702');
      expect(form.controls.wardNo.value).toBeNull();
    });

    it('keeps every choice when the whole group is disabled and enabled again', () => {
      form.controls.provinceCode.setValue('3');
      form.controls.districtCode.setValue('27');
      form.controls.localLevelCode.setValue('32701');
      form.controls.wardNo.setValue(16);

      form.disable();
      form.enable();

      expect(form.getRawValue()).toEqual(
        expect.objectContaining({ provinceCode: '3', districtCode: '27', localLevelCode: '32701', wardNo: 16 })
      );
      expect(form.controls.wardNo.enabled).toBe(true);
      expect(form.valid).toBe(true);
    });

    it('puts dependent fields back in step after the whole group is re-enabled', () => {
      form.disable();
      form.enable();
      expect(form.controls.districtCode.disabled).toBe(true);
      expect(form.controls.wardNo.disabled).toBe(true);
    });

    it('labels places in English first, or Nepali first when the app is in Nepali', () => {
      const option = component.provinces()[1];
      expect(component.label(option)).toBe('Bagmati Province (बागमती प्रदेश)');

      TestBed.inject(TranslateService).use('ne-NE');
      expect(component.label(option)).toBe('बागमती प्रदेश (Bagmati Province)');
    });
  });

  describe('a saved address', () => {
    it('opens with the saved choices and all fields available', async () => {
      await create((f) => patchMemberAddressForm(f, mockAddress()), '32701');

      expect(form.valid).toBe(true);
      expect(form.controls.wardNo.enabled).toBe(true);
      expect(component.wards()).toHaveLength(32);
    });

    it('keeps a merged local level selectable only for the address that uses it', async () => {
      await create(
        (f) => patchMemberAddressForm(f, mockAddress({ localLevelCode: '32799', localLevelActive: false, wardNo: 2 })),
        '32799'
      );
      expect(component.localLevels().map((l) => l.code)).toContain('32799');
      expect(form.valid).toBe(true);
    });
  });
});
