/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { ReportsComponent } from './reports.component';

describe('ReportsComponent — engine chips', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const report = (id: number, reportType: string) => ({
    id,
    reportName: `Report ${id}`,
    reportType,
    reportCategory: 'Loan'
  });

  /* A stock Fineract catalogue contains Table, SMS and Email reports. Email was
     absent from the hardcoded engine list, so those reports were counted by no
     chip at all. */
  const reports = [
    report(1, 'Table'),
    report(2, 'Table'),
    report(3, 'SMS'),
    report(4, 'Email'),
    report(5, 'Email')
  ];

  const configure = (data: any[]) => {
    TestBed.configureTestingModule({
      imports: [
        ReportsComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        // provideRouter supplies its own ActivatedRoute, so the stub has to be
        // registered after it to win.
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { data: of({ reports: data }), snapshot: { params: {} } }
        }
      ]
    });

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('counts every report, so the chips add up to the catalogue total', () => {
    configure(reports);

    const chipTotal = Object.values(component.engineCounts).reduce((sum, n) => sum + n, 0);

    expect(chipTotal).toBe(reports.length);
    expect(component.totalCount).toBe(reports.length);
  });

  it('gives a chip to an engine that is not in the preferred order list', () => {
    configure(reports);

    expect(component.engines).toContain('Email');
    expect(component.engineCounts['Email']).toBe(2);
  });

  it('leaves out engines that have no reports', () => {
    configure(reports);

    expect(component.engines).not.toContain('Pentaho');
    expect(component.engines).not.toContain('BIRT');
    expect(component.engines).not.toContain('Chart');
  });

  it('orders known engines first and appends the rest', () => {
    configure([
      report(1, 'Email'),
      report(2, 'SMS'),
      report(3, 'Table')
    ]);

    expect(component.engines).toEqual([
      'Table',
      'SMS',
      'Email'
    ]);
  });

  it('filters to the reports of a derived engine', () => {
    configure(reports);

    component.setEngineFilter('Email');

    expect(component.filteredCount).toBe(2);
  });
});
