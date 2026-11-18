/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { FormControl, Validators } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { MembershipService } from '../membership.service';
import { organisationCategoryLabel } from '../membership.models';
import { OrganisationCategorySelectComponent } from './organisation-category-select.component';

const COOPERATIVE = 31;
const COMPANY = 39;
const OWN = 52;
const list = [
  { codeValueId: COOPERATIVE, code: 'COOPERATIVE', name: 'Cooperative', mayBeMember: true },
  { codeValueId: COMPANY, code: 'PRIVATE_LIMITED', name: 'Private limited company', mayBeMember: false },
  { codeValueId: OWN, name: 'Savings group', mayBeMember: true }
];

describe('organisationCategoryLabel', () => {
  const words: Record<string, string> = { 'organisationCategory.COOPERATIVE': 'सहकारी संस्था' };
  const translate = { instant: (key: string) => words[key] ?? key } as unknown as TranslateService;

  it('translates by code, and falls back to the name', () => {
    expect(organisationCategoryLabel(translate, list[0])).toBe('सहकारी संस्था');
    expect(organisationCategoryLabel(translate, list[1])).toBe('Private limited company');
    expect(organisationCategoryLabel(translate, list[2])).toBe('Savings group');
  });
});

describe('OrganisationCategorySelectComponent', () => {
  async function select(value: number | null, enforce: boolean, current: { id: number; name: string } | null = null) {
    TestBed.configureTestingModule({
      imports: [
        OrganisationCategorySelectComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [{ provide: MembershipService, useValue: { organisationCategories: () => of(list) } }]
    });
    const fixture = TestBed.createComponent(OrganisationCategorySelectComponent);
    fixture.componentInstance.control = new FormControl(value, Validators.required);
    fixture.componentRef.setInput('enforce', enforce);
    fixture.componentRef.setInput('current', current);
    fixture.detectChanges();
    await fixture.whenStable();
    return fixture.componentInstance;
  }

  it('refuses a type that may not be members only while the rule applies', async () => {
    expect((await select(COMPANY, true)).control.hasError('refused')).toBe(true);
    TestBed.resetTestingModule();
    expect((await select(COMPANY, false)).control.hasError('refused')).toBe(false);
  });

  it('keeps the type already saved, even when refused today', async () => {
    const c = await select(COMPANY, true, { id: COMPANY, name: 'Private limited company' });
    expect(c.control.hasError('refused')).toBe(false);
    expect(c.refused(COMPANY)).toBe(false);
  });

  it('shows a saved type that is no longer in the list from the client data', async () => {
    const c = await select(77, true, { id: 77, name: 'Old type' });
    expect(c.shown().map((o) => o.name)).toContain('Old type');
    expect(c.control.valid).toBe(true);
  });
});
