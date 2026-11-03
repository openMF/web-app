/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { ContentComponent } from './content.component';

describe('ContentComponent — Main landmark and content architecture', () => {
  let fixture: ComponentFixture<ContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContentComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ContentComponent);
    fixture.detectChanges();
  });

  it('contains a semantic <main> landmark', () => {
    const mainEl = fixture.nativeElement.querySelector('main');
    expect(mainEl).not.toBeNull();
  });

  it('assigns id="main-content" to the main landmark', () => {
    const mainEl = fixture.nativeElement.querySelector('main');
    expect(mainEl?.getAttribute('id')).toBe('main-content');
  });

  it('assigns tabindex="-1" to allow programmatic focus without tab stop clutter', () => {
    const mainEl = fixture.nativeElement.querySelector('main');
    expect(mainEl?.getAttribute('tabindex')).toBe('-1');
  });

  it('encloses the router-outlet inside the main landmark', () => {
    const mainEl = fixture.nativeElement.querySelector('main');
    const routerOutlet = mainEl?.querySelector('router-outlet');
    expect(routerOutlet).not.toBeNull();
  });

  it('preserves the existing #push element outside the main landmark for sticky footer', () => {
    const pushEl = fixture.nativeElement.querySelector('#push');
    expect(pushEl).not.toBeNull();

    const mainEl = fixture.nativeElement.querySelector('main');
    expect(mainEl?.contains(pushEl)).toBe(false);
  });
});
