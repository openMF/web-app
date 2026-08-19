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
import { describe, expect, it, jest } from '@jest/globals';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';

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
        provideAnimationsAsync()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchToolComponent);
    TestBed.inject(FaIconLibrary).addIcons(faSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

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
});
