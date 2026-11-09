/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { InteractivityChecker } from '@angular/cdk/a11y';

import { SearchToolComponent } from './search-tool.component';

describe('SearchToolComponent', () => {
  let component: SearchToolComponent;
  let fixture: ComponentFixture<SearchToolComponent>;
  let router: { navigate: jest.Mock };

  const setup = async () => {
    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        SearchToolComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Router, useValue: router },
        {
          provide: InteractivityChecker,
          useValue: {
            isFocusable: (element: HTMLElement) => element.matches('input, button, a[href], [tabindex]'),
            isTabbable: (element: HTMLElement) => element.matches('input, button, a[href], [tabindex]'),
            isVisible: () => true,
            isDisabled: () => false
          }
        },
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchToolComponent);
    document.body.appendChild(fixture.nativeElement);
    TestBed.inject(FaIconLibrary).addIcons(faSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  afterEach(() => {
    fixture?.nativeElement?.remove();
  });

  it('navigates to the search page with only the query; scoping happens on the results page', async () => {
    await setup();
    component.query.patchValue('123');

    component.search();

    expect(router.navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: {
        query: '123'
      }
    });
  });

  it('closes the modal when a search is executed', async () => {
    await setup();
    component.searchVisible = true;

    component.search();

    expect(component.searchVisible).toBe(false);
  });

  it('moves focus into the search input when opening search', async () => {
    await setup();
    const triggerEl = fixture.nativeElement.querySelector('button.search-toggle') as HTMLButtonElement;
    triggerEl.focus();
    triggerEl.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('.spotlight-input') as HTMLInputElement;
    expect(input).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });

  it('tracks the original trigger when the modal opens', async () => {
    await setup();
    const triggerEl = fixture.nativeElement.querySelector('button.search-toggle') as HTMLButtonElement;
    triggerEl.focus();

    component.toggleSearchVisibility();
    fixture.detectChanges();

    expect(component.searchVisible).toBe(true);
    expect(component.triggerElement).toBe(triggerEl);
  });

  it('wraps Tab from the last control back to the first control', async () => {
    await setup();
    component.toggleSearchVisibility();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('.spotlight-input') as HTMLInputElement;
    const submitBtn = fixture.nativeElement.querySelector('.spotlight-go') as HTMLButtonElement;
    const anchors = fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');

    expect(input).toBeTruthy();
    expect(submitBtn).toBeTruthy();
    expect(anchors.length).toBe(2);

    submitBtn.focus();
    expect(document.activeElement).toBe(submitBtn);

    // The end anchor receives focus when Tab is pressed on the last control.
    (anchors[1] as HTMLElement).focus();
    expect(document.activeElement).toBe(input);
  });

  it('wraps Shift+Tab from the first control back to the last control', async () => {
    await setup();
    component.toggleSearchVisibility();
    fixture.detectChanges();
    await fixture.whenStable();

    const input = fixture.nativeElement.querySelector('.spotlight-input') as HTMLInputElement;
    const submitBtn = fixture.nativeElement.querySelector('.spotlight-go') as HTMLButtonElement;
    const anchors = fixture.nativeElement.querySelectorAll('.cdk-focus-trap-anchor');

    expect(input).toBeTruthy();
    expect(submitBtn).toBeTruthy();
    expect(anchors.length).toBe(2);

    input.focus();
    expect(document.activeElement).toBe(input);

    // The start anchor receives focus when Shift+Tab is pressed on the first control.
    (anchors[0] as HTMLElement).focus();
    expect(document.activeElement).toBe(submitBtn);
  });

  it('returns focus to the search trigger even if another element was focused before opening', async () => {
    await setup();
    const otherButton = document.createElement('button');
    document.body.appendChild(otherButton);
    const triggerEl = fixture.nativeElement.querySelector('button.search-toggle') as HTMLButtonElement;

    try {
      otherButton.focus();
      expect(document.activeElement).toBe(otherButton);

      component.toggleSearchVisibility();
      fixture.detectChanges();
      await fixture.whenStable();

      component.closeModal();
      fixture.detectChanges();
      await fixture.whenStable();

      expect(document.activeElement).toBe(triggerEl);
    } finally {
      otherButton.remove();
    }
  });

  it('does not move focus out of a dialog that is reopened before navigation resolves', async () => {
    await setup();
    const triggerEl = fixture.nativeElement.querySelector('button.search-toggle') as HTMLButtonElement;
    triggerEl.focus();

    component.toggleSearchVisibility();
    fixture.detectChanges();
    await fixture.whenStable();

    let resolveNavigation!: () => void;
    router.navigate.mockReturnValue(
      new Promise<void>((resolve) => {
        resolveNavigation = resolve;
      })
    );

    component.query.patchValue('savings');
    component.search();
    fixture.detectChanges();

    // Reopen the dialog while the navigation promise is still pending.
    component.toggleSearchVisibility();
    fixture.detectChanges();
    await fixture.whenStable();

    resolveNavigation();
    await Promise.resolve();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.spotlight-wrap') as HTMLElement;
    expect(component.searchVisible).toBe(true);
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(triggerEl);
  });

  it('closes the modal when Escape is pressed', async () => {
    await setup();
    component.searchVisible = true;
    fixture.detectChanges();

    component.onEscape();

    expect(component.searchVisible).toBe(false);
  });

  it('restores trigger focus when closed via Escape', async () => {
    await setup();
    const triggerEl = fixture.nativeElement.querySelector('button.search-toggle') as HTMLButtonElement;
    triggerEl.focus();

    component.toggleSearchVisibility();
    fixture.detectChanges();

    component.onEscape();
    fixture.detectChanges();

    expect(document.activeElement).toBe(triggerEl);
  });

  it('restores trigger focus when closed via backdrop click', async () => {
    await setup();
    const triggerEl = fixture.nativeElement.querySelector('button.search-toggle') as HTMLButtonElement;
    triggerEl.focus();

    component.toggleSearchVisibility();
    fixture.detectChanges();

    const backdrop = fixture.nativeElement.querySelector('.search-backdrop') as HTMLElement;
    backdrop.click();
    fixture.detectChanges();

    expect(component.searchVisible).toBe(false);
    expect(document.activeElement).toBe(triggerEl);
  });

  it('exposes a meaningful accessible name on the search trigger', async () => {
    await setup();
    const triggerEl = fixture.nativeElement.querySelector('button.search-toggle') as HTMLButtonElement;

    expect(triggerEl.getAttribute('aria-label')).toBeTruthy();
    expect(triggerEl.getAttribute('aria-label')).toBe('labels.text.Search');
  });

  it('exposes dialog semantics and an accessible name on the dialog', async () => {
    await setup();
    component.toggleSearchVisibility();
    fixture.detectChanges();

    const dialog = fixture.nativeElement.querySelector('.spotlight-wrap') as HTMLElement;
    expect(dialog.getAttribute('role')).toBe('dialog');
    expect(dialog.getAttribute('aria-modal')).toBe('true');

    const labelledBy = dialog.getAttribute('aria-labelledby');
    expect(labelledBy).toBeTruthy();

    const titleEl = fixture.nativeElement.querySelector(`#${labelledBy}`) as HTMLElement;
    expect(titleEl).toBeTruthy();
    expect(titleEl.textContent?.trim()).toBe('labels.text.Search');
  });

  it('preserves navigation and restores trigger focus on search submission', async () => {
    await setup();
    const triggerEl = fixture.nativeElement.querySelector('button.search-toggle') as HTMLButtonElement;
    triggerEl.focus();

    component.toggleSearchVisibility();
    fixture.detectChanges();

    component.query.patchValue('savings');
    component.search();
    fixture.detectChanges();

    expect(router.navigate).toHaveBeenCalledWith(['/search'], {
      queryParams: { query: 'savings' }
    });
    expect(component.searchVisible).toBe(false);
    expect(document.activeElement).toBe(triggerEl);
  });
});
