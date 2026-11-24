/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { CdkStepper } from '@angular/cdk/stepper';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { MemberAddressForm } from '../member-address-form';
import { NepalLocationIndex } from '../nepal-location-index';
import { NepalLocationService } from '../nepal-location.service';
import { MOCK_LOCATIONS } from '../testing/nepal-locations.mock';
import { MemberAddressStepComponent } from './member-address-step.component';

describe('MemberAddressStepComponent', () => {
  let fixture: ComponentFixture<MemberAddressStepComponent>;
  let component: MemberAddressStepComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        MemberAddressStepComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: CdkStepper, useValue: { next: jest.fn(), previous: jest.fn() } },
        {
          provide: NepalLocationService,
          useValue: { locations: () => of(new NepalLocationIndex(MOCK_LOCATIONS)) }
        }
      ]
    }).compileComponents();
    TestBed.inject(FaIconLibrary).addIcons(faArrowLeft, faArrowRight);

    fixture = TestBed.createComponent(MemberAddressStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const fill = (form: MemberAddressForm, localLevel: string, district: string, ward: number) => {
    form.controls.provinceCode.setValue('3');
    form.controls.districtCode.setValue(district);
    form.controls.localLevelCode.setValue(localLevel);
    form.controls.wardNo.setValue(ward);
  };

  it('requires the permanent address and records no temporary address by default', () => {
    expect(component.valid()).toBe(false);
    expect(component.draft()).toBeNull();

    fill(component.permanentForm, '32701', '27', 16);

    expect(component.valid()).toBe(true);
    expect(component.draft()).toEqual({
      permanent: { sameAsPermanent: false, localLevelCode: '32701', wardNo: 16, tole: null, houseNumber: null },
      temporary: null
    });
    expect(component.temporaryPreview()).toBeNull();
  });

  it('records a temporary address that follows the permanent one', () => {
    fill(component.permanentForm, '32701', '27', 16);
    component.temporaryChoice.setValue('SAME');

    expect(component.draft()?.temporary).toEqual({ sameAsPermanent: true });
    expect(component.temporaryPreview()).toEqual(component.permanentPreview());
  });

  it('requires a complete temporary address when it is different', () => {
    fill(component.permanentForm, '32701', '27', 16);
    component.temporaryChoice.setValue('DIFFERENT');
    fixture.detectChanges();

    expect(component.valid()).toBe(false);
    expect(fixture.nativeElement.querySelectorAll('mifosx-member-address-fields')).toHaveLength(2);

    fill(component.temporaryForm, '32801', '28', 3);
    expect(component.valid()).toBe(true);
    expect(component.draft()?.temporary).toEqual(
      expect.objectContaining({ sameAsPermanent: false, localLevelCode: '32801', wardNo: 3 })
    );
    expect(component.temporaryPreview()?.localLevelNameEn).toBe('Bhaktapur Municipality');
  });

  it('shows a different temporary address untouched, even after Next was pressed without one', () => {
    component.markAllAsTouched();
    expect(component.temporaryForm.touched).toBe(false);

    component.temporaryChoice.setValue('DIFFERENT');
    component.markAllAsTouched();
    expect(component.temporaryForm.controls.provinceCode.touched).toBe(true);

    component.temporaryChoice.setValue('NONE');
    component.temporaryChoice.setValue('DIFFERENT');
    expect(component.temporaryForm.touched).toBe(false);
  });

  it('previews the permanent address as it will be saved', () => {
    expect(component.permanentPreview()).toBeNull();
    fill(component.permanentForm, '32702', '27', 5);
    component.permanentForm.controls.tole.setValue('Chapali');

    expect(component.permanentPreview()).toEqual(
      expect.objectContaining({ localLevelNameEn: 'Budhanilkantha Municipality', wardNo: 5, tole: 'Chapali' })
    );
  });
});
