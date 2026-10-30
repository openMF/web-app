/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, RouterLink, provideRouter } from '@angular/router';

/** Directive under test */
import { EntityRowLinkDirective } from './entity-row-link.directive';

import { describe, it, expect, jest, beforeEach } from '@jest/globals';

/**
 * Host component for the directive under test.
 *
 * The row carries both [routerLink] and mifosxEntityRowLink, mirroring the real
 * entity list templates. It also contains a nested interactive button to verify
 * that keyboard events originating there are not hijacked by the row.
 */
@Component({
  standalone: true,
  imports: [
    EntityRowLinkDirective,
    RouterLink
  ],
  template: `
    <div data-testid="row" mifosxEntityRowLink [routerLink]="route">
      <button data-testid="nested" type="button">Nested action</button>
    </div>
  `
})
class EntityRowLinkHostComponent {
  readonly route = [
    '/clients',
    1,
    'general'
  ];
}

describe('EntityRowLinkDirective', () => {
  let fixture: ComponentFixture<EntityRowLinkHostComponent>;
  let router: Router;
  let navigateByUrlSpy: any;
  let row: HTMLElement;
  let nested: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EntityRowLinkHostComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(EntityRowLinkHostComponent);
    router = TestBed.inject(Router);
    navigateByUrlSpy = jest.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture.detectChanges();

    row = fixture.nativeElement.querySelector('[data-testid="row"]');
    nested = fixture.nativeElement.querySelector('[data-testid="nested"]');
  });

  it('exposes an accessible link role and is keyboard-focusable', () => {
    expect(row.getAttribute('role')).toBe('link');
    expect(row.getAttribute('tabindex')).toBe('0');
  });

  it('navigates exactly once when Enter is pressed on the focused row', () => {
    const expectedUrlTree = router.createUrlTree([
      '/clients',
      1,
      'general'
    ]);

    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
    expect(router.serializeUrl(navigateByUrlSpy.mock.calls[0][0])).toBe(router.serializeUrl(expectedUrlTree));
  });

  it('navigates exactly once when Space is pressed on the focused row', () => {
    const expectedUrlTree = router.createUrlTree([
      '/clients',
      1,
      'general'
    ]);
    const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });

    row.dispatchEvent(event);

    expect(event.defaultPrevented).toBe(true);
    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
    expect(router.serializeUrl(navigateByUrlSpy.mock.calls[0][0])).toBe(router.serializeUrl(expectedUrlTree));
  });

  it('does not navigate on unrelated keys', () => {
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true }));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));

    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });

  it('does not navigate repeatedly on repeated key events', () => {
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
  });

  it('keeps the repeat guard until the activation key itself is released', () => {
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    // Releasing another key must not clear the guard for the still-held Enter key.
    row.dispatchEvent(new KeyboardEvent('keyup', { key: 'a', bubbles: true }));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);

    row.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter', bubbles: true }));
    row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(navigateByUrlSpy).toHaveBeenCalledTimes(2);
  });

  it('leaves mouse-click navigation to RouterLink unchanged', () => {
    row.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));

    expect(navigateByUrlSpy).toHaveBeenCalledTimes(1);
  });

  it('does not hijack keyboard events from nested interactive controls', () => {
    nested.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));

    expect(navigateByUrlSpy).not.toHaveBeenCalled();
  });
});
