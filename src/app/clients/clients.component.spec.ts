/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ClientsComponent, DEBOUNCE_MS } from './clients.component';
import { ClientsService } from './clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { TranslateModule } from '@ngx-translate/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faDownload, faPlus, faStop } from '@fortawesome/free-solid-svg-icons';
import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals';

describe('ClientsComponent — debounce search', () => {
  let component: ClientsComponent;
  let fixture: ComponentFixture<ClientsComponent>;
  let clientsService: jest.Mocked<ClientsService>;

  const emptyPage = { content: [] as any[], totalElements: 0, numberOfElements: 0 };

  beforeEach(async () => {
    jest.useFakeTimers();

    clientsService = {
      searchByText: jest.fn(() => of(emptyPage))
    } as any;

    const authService = { getCredentials: jest.fn(() => ({ permissions: ['ALL_FUNCTIONS'] })) } as any;

    await TestBed.configureTestingModule({
      imports: [
        ClientsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ClientsService, useValue: clientsService },
        { provide: AuthenticationService, useValue: authService },
        provideAnimationsAsync(),
        provideRouter([])
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faDownload, faPlus, faStop);

    fixture = TestBed.createComponent(ClientsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Reset call count from ngOnInit (preloadClients may trigger a call)
    clientsService.searchByText.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not search before 500 ms have elapsed', () => {
    component.onSearchInput('amara');
    jest.advanceTimersByTime(DEBOUNCE_MS - 1);
    expect(clientsService.searchByText).not.toHaveBeenCalled();
  });

  it('should search after 500 ms pause', () => {
    component.onSearchInput('amara');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('amara', 0, expect.any(Number), '', '');
  });

  it('should reset the timer on rapid typing and fire only once', () => {
    component.onSearchInput('k');
    jest.advanceTimersByTime(200);
    component.onSearchInput('ka');
    jest.advanceTimersByTime(200);
    component.onSearchInput('kwame');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('kwame', 0, expect.any(Number), '', '');
  });

  it('should ignore duplicate consecutive values', () => {
    component.onSearchInput('agaba');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    component.onSearchInput('agaba');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
  });

  it('should search immediately when Enter is pressed', () => {
    component.search('bob');
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('bob', 0, expect.any(Number), '', '');
  });

  it('should not fire a second request when Enter is pressed while debounce is pending', () => {
    component.onSearchInput('kofi');
    jest.advanceTimersByTime(200);
    component.search('kofi');
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
  });

  it('should search correctly with non-ASCII characters', () => {
    component.onSearchInput('مريم');
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('مريم', 0, expect.any(Number), '', '');
  });

  it('should not search during IME composition but should search on compositionend', () => {
    const inputEl: HTMLInputElement = fixture.nativeElement.querySelector('input[matInput]');

    inputEl.dispatchEvent(new CompositionEvent('compositionstart'));
    fixture.detectChanges();

    // Partial composition — input fires but should be suppressed
    inputEl.value = 'مر';
    inputEl.dispatchEvent(new Event('input'));
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).not.toHaveBeenCalled();

    // Composition ends with final value
    inputEl.value = 'مريم';
    inputEl.dispatchEvent(new CompositionEvent('compositionend'));
    fixture.detectChanges();

    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).toHaveBeenCalledTimes(1);
    expect(clientsService.searchByText).toHaveBeenCalledWith('مريم', 0, expect.any(Number), '', '');
  });

  it('should not fire debounced search after component is destroyed', () => {
    component.onSearchInput('carol');
    component.ngOnDestroy();
    jest.advanceTimersByTime(DEBOUNCE_MS);
    expect(clientsService.searchByText).not.toHaveBeenCalled();
  });
});
