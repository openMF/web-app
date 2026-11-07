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
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { ReportsComponent } from './reports.component';

interface ReportFixture {
  id: number;
  reportName: string;
  reportType: string;
  reportCategory: string;
}

describe('ReportsComponent — category group disclosure accessibility', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const createReport = (id: number, reportName: string, reportType: string, reportCategory: string): ReportFixture => ({
    id,
    reportName,
    reportType,
    reportCategory
  });

  const testReports: ReportFixture[] = [
    createReport(1, 'Active Loans Details', 'Table', 'Loan'),
    createReport(2, 'Loan Repayment Schedule', 'Table', 'Loan'),
    createReport(3, 'Client Listing', 'Table', 'Client'),
    createReport(4, 'General Ledger Summary', 'Table', 'Accounting')
  ];

  const configureTestBed = (reports: ReportFixture[] = testReports) => {
    TestBed.configureTestingModule({
      imports: [
        ReportsComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ reports }),
            snapshot: { params: {} }
          }
        }
      ]
    });

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  beforeEach(() => {
    (localStorage.getItem as jest.Mock).mockReturnValue(null);
    TestBed.resetTestingModule();
  });

  afterEach(() => {
    (localStorage.getItem as jest.Mock).mockReset();
  });

  it('1. renders every category header as a native button with type="button"', () => {
    configureTestBed();
    const groupHeadButtons = fixture.nativeElement.querySelectorAll('.catalog .group-head');

    expect(groupHeadButtons.length).toBe(3);
    groupHeadButtons.forEach((btn: HTMLElement) => {
      expect(btn.tagName.toLowerCase()).toBe('button');
      expect(btn.getAttribute('type')).toBe('button');
    });
  });

  it('2. retains semantic heading structure by containing the button inside an h3.group-heading', () => {
    configureTestBed();
    const groupHeadButtons = fixture.nativeElement.querySelectorAll('.catalog button.group-head');

    expect(groupHeadButtons.length).toBeGreaterThan(0);
    groupHeadButtons.forEach((btn: HTMLElement) => {
      const heading = btn.parentElement;
      expect(heading?.tagName.toLowerCase()).toBe('h3');
      expect(heading?.classList.contains('group-heading')).toBe(true);
    });
  });

  it('3. derives an accessible name from the report category label while keeping the caret decorative', () => {
    configureTestBed();
    const firstButton = fixture.nativeElement.querySelector('.catalog button.group-head');
    const caret = firstButton.querySelector('.caret');
    const titleText = firstButton.querySelector('.group-title-text');

    expect(caret.getAttribute('aria-hidden')).toBe('true');
    expect(titleText.textContent.trim()).toBe('Loan');
    expect(firstButton.textContent).toContain('Loan');
  });

  it('4. initially exposes aria-expanded="true" for an expanded group', () => {
    configureTestBed();
    const firstButton = fixture.nativeElement.querySelector('.catalog button.group-head');

    expect(firstButton.getAttribute('aria-expanded')).toBe('true');
    expect(component.isGroupCollapsed('labels.text.Loan')).toBe(false);
  });

  it('5. initially exposes aria-expanded="false" when a group is stored as collapsed', () => {
    (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
      if (key === 'mifosx.reports.collapsedGroups') {
        return JSON.stringify(['labels.text.Loan']);
      }
      return null;
    });
    configureTestBed();

    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.catalog button.group-head')
    );
    const loanButton = buttons.find((btn) => btn.textContent?.includes('Loan'));

    expect(loanButton).toBeDefined();
    expect(loanButton?.getAttribute('aria-expanded')).toBe('false');
    expect(component.isGroupCollapsed('labels.text.Loan')).toBe(true);
  });

  it('6. updates aria-expanded when toggling a group', () => {
    configureTestBed();
    const firstButton: HTMLButtonElement = fixture.nativeElement.querySelector('.catalog button.group-head');

    expect(firstButton.getAttribute('aria-expanded')).toBe('true');

    firstButton.click();
    fixture.detectChanges();
    expect(firstButton.getAttribute('aria-expanded')).toBe('false');

    firstButton.click();
    fixture.detectChanges();
    expect(firstButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('7. references the correct existing group content element via aria-controls', () => {
    configureTestBed();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.catalog button.group-head')
    );

    expect(buttons.length).toBeGreaterThan(0);
    buttons.forEach((btn) => {
      const controlsId = btn.getAttribute('aria-controls');
      expect(controlsId).toBeTruthy();

      const controlledElement = fixture.nativeElement.querySelector(`#${controlsId}`);
      expect(controlledElement).not.toBeNull();
      expect(controlledElement.classList.contains('group-body')).toBe(true);

      const groupContainer = btn.closest('.group');
      const expectedBody = groupContainer?.querySelector('.group-body');
      expect(expectedBody?.id).toBe(controlsId);
    });
  });

  it('8. provides a unique and stable content ID for each category', () => {
    configureTestBed();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.catalog button.group-head')
    );
    const controlsIds = buttons.map((btn) => btn.getAttribute('aria-controls'));

    expect(controlsIds).toEqual([
      'report-group-loan',
      'report-group-client',
      'report-group-accounting'
    ]);
    const uniqueIds = new Set(controlsIds);
    expect(uniqueIds.size).toBe(controlsIds.length);
  });

  it('9. invokes the toggle behaviour exactly once per click without duplicate events', () => {
    configureTestBed();
    const toggleSpy = jest.spyOn(component, 'toggleGroup');
    const firstButton: HTMLButtonElement = fixture.nativeElement.querySelector('.catalog button.group-head');

    firstButton.click();
    expect(toggleSpy).toHaveBeenCalledTimes(1);
    expect(toggleSpy).toHaveBeenCalledWith('labels.text.Loan');
  });

  it('10. retains independent collapse state across multiple categories', () => {
    configureTestBed();
    const buttons: HTMLButtonElement[] = Array.from(
      fixture.nativeElement.querySelectorAll('.catalog button.group-head')
    );
    const [
      loanButton,
      clientButton,
      accountingButton
    ] = buttons;

    loanButton.click();
    fixture.detectChanges();

    expect(loanButton.getAttribute('aria-expanded')).toBe('false');
    expect(clientButton.getAttribute('aria-expanded')).toBe('true');
    expect(accountingButton.getAttribute('aria-expanded')).toBe('true');

    clientButton.click();
    fixture.detectChanges();

    expect(loanButton.getAttribute('aria-expanded')).toBe('false');
    expect(clientButton.getAttribute('aria-expanded')).toBe('false');
    expect(accountingButton.getAttribute('aria-expanded')).toBe('true');
  });

  it('11. preserves existing report catalog rendering and group metadata', () => {
    configureTestBed();
    const groups = fixture.nativeElement.querySelectorAll('.catalog .group');
    expect(groups.length).toBe(3);

    const firstGroupMeta = groups[0].querySelector('.group-meta');
    expect(firstGroupMeta.textContent.trim()).toBe('2');

    const loanRows = groups[0].querySelectorAll('.group-body .row');
    expect(loanRows.length).toBe(2);

    const secondGroupMeta = groups[1].querySelector('.group-meta');
    expect(secondGroupMeta.textContent.trim()).toBe('1');
  });
});

describe('ReportsComponent — engine chips and catalog integration', () => {
  let component: ReportsComponent;
  let fixture: ComponentFixture<ReportsComponent>;

  const createReport = (id: number, reportName: string, reportType: string, reportCategory: string): ReportFixture => ({
    id,
    reportName,
    reportType,
    reportCategory
  });

  const reports: ReportFixture[] = [
    createReport(1, 'Table Report 1', 'Table', 'Loan'),
    createReport(2, 'Table Report 2', 'Table', 'Loan'),
    createReport(3, 'SMS Report 1', 'SMS', 'Client'),
    createReport(4, 'Chart Report 1', 'Chart', 'Accounting')
  ];

  beforeEach(() => {
    localStorage.clear();
    TestBed.resetTestingModule();

    TestBed.configureTestingModule({
      imports: [
        ReportsComponent,
        NoopAnimationsModule,
        TranslateModule.forRoot()
      ],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({ reports }),
            snapshot: { params: {} }
          }
        }
      ]
    });

    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('counts reports by engine and displays total catalogue count', () => {
    expect(component.totalCount).toBe(4);
    expect(component.engineCounts['Table']).toBe(2);
    expect(component.engineCounts['SMS']).toBe(1);
    expect(component.engineCounts['Chart']).toBe(1);
  });

  it('filters catalog when engine filter is selected', () => {
    component.setEngineFilter('Table');
    fixture.detectChanges();

    expect(component.selectedEngine).toBe('Table');
    expect(component.filteredCount).toBe(2);

    const groupRows = fixture.nativeElement.querySelectorAll('.catalog .group-body .row');
    expect(groupRows.length).toBe(2);
  });

  it('clears active filters back to full catalog', () => {
    component.setEngineFilter('Table');
    component.onSearchInput('Repayment');
    fixture.detectChanges();

    expect(component.hasActiveFilters()).toBe(true);

    component.clearFilters();
    fixture.detectChanges();

    expect(component.hasActiveFilters()).toBe(false);
    expect(component.filteredCount).toBe(4);
  });
});
