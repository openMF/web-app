/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';
import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheck, faSearch, faTimes, faTrash, faUndo } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Observable, of, Subject, throwError } from 'rxjs';
import enUs from 'assets/translations/en-US.json';
import frFr from 'assets/translations/fr-FR.json';

import { ClientsService } from 'app/clients/clients.service';
import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { environment } from 'environments/environment';
import { TasksService } from '../../tasks.service';
import { CheckerInboxComponent } from './checker-inbox.component';

/** The slice of the `/clients` search response the customer autocomplete reads. */
interface CustomerOption {
  id: number;
  displayName: string;
}

interface CustomerLookupResponse {
  content: CustomerOption[];
}

describe('CheckerInboxComponent', () => {
  let component: CheckerInboxComponent;
  let fixture: ComponentFixture<CheckerInboxComponent>;
  let searchByText: jest.Mock;
  let getMakerCheckerData: jest.Mock;
  let translate: TranslateService;

  const record = { id: 23, actionName: 'UPDATE', entityName: 'CLIENT', resourceId: 1, madeOnDate: 1789064261493 };
  const originalRbac = environment.productionModeEnableRBAC;

  function createComponent(
    customerLookup: Observable<CustomerLookupResponse> = of({ content: [] }),
    permissions: string[] = ['ALL_FUNCTIONS']
  ) {
    searchByText = jest.fn(() => customerLookup);
    getMakerCheckerData = jest.fn(() => of([record]));

    TestBed.configureTestingModule({
      imports: [
        CheckerInboxComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        provideRouter([]),
        { provide: TasksService, useValue: { getMakerCheckerData } },
        { provide: ClientsService, useValue: { searchByText } },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ permissions }) } },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              makerCheckerResource: [record],
              makerCheckerTemplate: { actionNames: ['UPDATE'], entityNames: ['CLIENT'] }
            })
          }
        }
      ]
    });

    TestBed.inject(FaIconLibrary).addIcons(faCheck, faSearch, faTimes, faTrash, faUndo);

    fixture = TestBed.createComponent(CheckerInboxComponent);
    component = fixture.componentInstance;
    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', enUs);
    translate.setTranslation('fr-FR', frFr);
    fixture.detectChanges();
  }

  function render() {
    // The component is OnPush, so mark its view dirty before rendering direct state changes.
    fixture.debugElement.injector.get(ChangeDetectorRef).markForCheck();
    fixture.detectChanges();
  }

  /** Switches the fixture to a real locale file so assertions cover the shipped text, not the key. */
  function useLocale(locale: 'en-US' | 'fr-FR') {
    translate.use(locale);
    render();
  }

  function renderedText(): string {
    return (fixture.nativeElement as HTMLElement).textContent || '';
  }

  afterEach(() => {
    environment.productionModeEnableRBAC = originalRbac;
  });

  it('clears every filter, the customer control and the options, then reloads', () => {
    createComponent();
    component.makerCheckerSearchForm.patchValue({
      makerDateTimeFrom: new Date(2026, 0, 1),
      makerDateTimeTo: new Date(2026, 11, 31),
      actionName: 'UPDATE',
      entityName: 'CLIENT',
      resourceId: '1'
    });
    component.customerControl.setValue({ id: 1, displayName: 'Web Tester' });
    component.customers = [{ id: 1, displayName: 'Web Tester' }];

    component.resetFilters();

    expect(component.makerCheckerSearchForm.value).toEqual({
      makerDateTimeFrom: null,
      makerDateTimeTo: null,
      actionName: null,
      entityName: null,
      resourceId: null
    });
    expect(component.customerControl.value).toBe('');
    expect(component.customers).toEqual([]);
    expect(getMakerCheckerData).toHaveBeenCalled();
  });

  it('does not send a cleared filter as a query parameter', () => {
    createComponent();
    component.makerCheckerSearchForm.patchValue({ actionName: 'UPDATE', resourceId: '1' });

    component.resetFilters();

    const params = getMakerCheckerData.mock.calls.at(-1)[0];
    expect(params.actionName).toBeNull();
    expect(params.resourceId).toBeNull();
    expect(params.clientId).toBeUndefined();
  });

  it('drops a customer lookup that resolves after the reset', fakeAsync(() => {
    const lookup = new Subject<CustomerLookupResponse>();
    createComponent(lookup);

    component.customerControl.setValue('web');
    tick(300);
    expect(searchByText).toHaveBeenCalledWith('web', 0, 20);

    component.resetFilters();
    lookup.next({ content: [{ id: 1, displayName: 'Web Tester' }] });
    lookup.complete();

    // Asserted inside the debounce window: switchMap has not cancelled the lookup yet,
    // so only the subscriber's guard can keep the stale options out.
    expect(component.customers).toEqual([]);

    tick(300);
    expect(component.customers).toEqual([]);
  }));

  describe('operational messages', () => {
    it('renders the processing status in French with the item count', () => {
      createComponent();
      useLocale('fr-FR');

      component.processing = true;
      component.processingCount = 3;
      render();

      expect(renderedText()).toContain('Traitement de 3 élément(s) de vérification…');
      expect(renderedText()).not.toContain('Processing 3 checker item(s)');
    });

    it('renders the processed summary and failed record IDs in French', () => {
      createComponent();
      useLocale('fr-FR');

      component.actionResult = {
        action: 'approve',
        succeeded: 2,
        failed: [
          { id: 5, error: 'not allowed' },
          { id: 7 }
        ]
      };
      render();

      expect(renderedText()).toContain('4 tâches traitées : 2 réussies, 2 échouées.');
      expect(renderedText()).toContain('ID des enregistrements en échec :');
      expect(renderedText()).toContain('5: not allowed;');
      expect(renderedText()).toContain('7;');
    });

    it('renders the loading status in French', () => {
      createComponent();
      useLocale('fr-FR');

      component.loading = true;
      render();

      expect(renderedText()).toContain('Chargement de la boîte de réception du vérificateur…');
    });

    it('renders a translatable error when the maker-checkers request fails', () => {
      createComponent();
      useLocale('fr-FR');
      getMakerCheckerData.mockReturnValue(throwError(() => new Error('makercheckers request failed')));

      component.search();
      render();

      expect(renderedText()).toContain(
        'Impossible de charger la boîte de réception du vérificateur. Veuillez relancer votre recherche.'
      );
      expect(renderedText()).not.toContain('Unable to load checker inbox');
    });

    it('renders the permission message in French when no row can be actioned', () => {
      environment.productionModeEnableRBAC = true;
      createComponent(of({ content: [] }), []);
      useLocale('fr-FR');

      expect(renderedText()).toContain(
        'Vous n’avez pas l’autorisation d’agir sur les éléments de vérification de cette liste.'
      );
    });

    it('keeps the original English wording', () => {
      createComponent();
      useLocale('en-US');

      component.processing = true;
      component.processingCount = 3;
      render();
      expect(renderedText()).toContain('Processing 3 checker item(s)…');

      component.processing = false;
      component.actionResult = {
        action: 'approve',
        succeeded: 2,
        failed: [
          { id: 5, error: 'not allowed' },
          { id: 7 }
        ]
      };
      render();
      expect(renderedText()).toContain('4 tasks processed: 2 succeeded, 2 failed.');
      expect(renderedText()).toContain('Failed record IDs:');

      component.actionResult = null;
      component.loading = true;
      render();
      expect(renderedText()).toContain('Loading checker inbox…');

      component.loading = false;
      component.searchError = true;
      render();
      expect(renderedText()).toContain('Unable to load checker inbox. Please try your search again.');
    });

    it('keeps the original English permission wording', () => {
      environment.productionModeEnableRBAC = true;
      createComponent(of({ content: [] }), []);
      useLocale('en-US');

      expect(renderedText()).toContain('You do not have permission to action the checker items in this list.');
    });
  });
});
