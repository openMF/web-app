/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCheckCircle, faEdit, faPlus, faTimesCircle, faTrash } from '@fortawesome/free-solid-svg-icons';
import { of } from 'rxjs';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { SystemService } from 'app/system/system.service';
import { CreateDataTableComponent } from './create-data-table.component';

describe('CreateDataTableComponent', () => {
  let fixture: ComponentFixture<CreateDataTableComponent>;
  let component: CreateDataTableComponent;
  let dialogOpenSpy: jest.Mock;

  beforeEach(async () => {
    const translations: Record<string, string> = {};
    const translateService = {
      instant: jest.fn((key: string) => translations[key] || key),
      get: jest.fn((key: string) => of(translations[key] || key)),
      onLangChange: of({ lang: 'en' }),
      onTranslationChange: of({}),
      onDefaultLangChange: of({ lang: 'en' })
    };

    dialogOpenSpy = jest.fn();

    await TestBed.configureTestingModule({
      imports: [
        CreateDataTableComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideNoopAnimations(),
        { provide: ActivatedRoute, useValue: { data: of({ columnCodes: [] }) } },
        { provide: MatDialog, useValue: { open: dialogOpenSpy } },
        { provide: Router, useValue: { navigate: jest.fn() } },
        { provide: SystemService, useValue: { createDataTable: jest.fn(() => of({})) } },
        { provide: TranslateService, useValue: translateService }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faCheckCircle, faEdit, faPlus, faTimesCircle, faTrash);

    fixture = TestBed.createComponent(CreateDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('keeps an edited column length when the dialog is closed with changes', () => {
    component.columnData = [
      {
        columnName: 'existing_column',
        columnDisplayType: 'String',
        isColumnNullable: true,
        columnLength: '10',
        columnCode: '',
        type: 'existing',
        isColumnUnique: false,
        isColumnIndexed: false
      }
    ];
    component.setColumns();

    dialogOpenSpy.mockReturnValue({
      afterClosed: () =>
        of({
          name: 'existing_column',
          type: 'String',
          length: '50',
          mandatory: false,
          unique: false,
          indexed: false,
          code: ''
        })
    });

    component.editColumn(component.columnData[0]);

    expect(component.columnData.length).toBe(1);
    expect(component.columnData[0].columnLength).toBe('50');
  });
});
