/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCircle, faUsers } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import enUs from 'assets/translations/en-US.json';
import frFr from 'assets/translations/fr-FR.json';
import { SettingsService } from 'app/settings/settings.service';

import { GroupNavigationComponent } from './group-navigation.component';
import { LoanAccountTableComponent } from '../loan-account-table/loan-account-table.component';
import { SavingsAccountTableComponent } from '../savings-account-table/savings-account-table.component';

@Component({ selector: 'mifosx-loan-account-table', standalone: true, template: '' })
class LoanAccountTableStubComponent {
  @Input() loanAccountData: any;
}

@Component({ selector: 'mifosx-savings-account-table', standalone: true, template: '' })
class SavingsAccountTableStubComponent {
  @Input() savingsAccountData: any;
}

const ENGLISH_LABELS = [
  'Details',
  'Loan Accounts',
  'Savings Accounts'
];
const FRENCH_LABELS = [
  'Détails',
  'Comptes de prêt',
  'Comptes d’épargne'
];

describe('GroupNavigationComponent', () => {
  let fixture: ComponentFixture<GroupNavigationComponent>;
  let translate: TranslateService;

  function tabLabels(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        GroupNavigationComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        DatePipe,
        provideNoopAnimations(),
        {
          provide: SettingsService,
          useValue: { dateFormat: 'dd MMMM yyyy', language: { name: 'English', code: 'en' } }
        }
      ]
    })
      .overrideComponent(GroupNavigationComponent, {
        remove: { imports: [
            LoanAccountTableComponent,
            SavingsAccountTableComponent
          ] },
        add: { imports: [
            LoanAccountTableStubComponent,
            SavingsAccountTableStubComponent
          ] }
      })
      .compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faUsers, faCircle);

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', enUs);
    translate.setTranslation('fr-FR', frFr);
    translate.use('en-US');

    fixture = TestBed.createComponent(GroupNavigationComponent);
    fixture.componentInstance.groupData = {
      name: 'Group One',
      accountNo: '0001',
      status: { code: 'groupingStatusType.active', value: 'Active' },
      staffName: 'Jane Doe',
      activationDate: '2024-01-01'
    };
    fixture.componentInstance.groupAccountsData = {
      loanAccounts: [{ id: 1 }],
      savingsAccounts: [{ id: 2 }]
    };
    fixture.componentInstance.clientData = [];
    fixture.detectChanges();
  });

  it('renders the three profile tab labels in English', () => {
    expect(tabLabels()).toEqual(ENGLISH_LABELS);
  });

  it('renders the three profile tab labels in French', () => {
    translate.use('fr-FR');
    fixture.detectChanges();

    expect(tabLabels()).toEqual(FRENCH_LABELS);
  });

  it('keeps the existing tab selection behaviour', () => {
    const tabs = fixture.nativeElement.querySelectorAll('[role="tab"]');

    expect(tabs[0].getAttribute('aria-selected')).toBe('true');

    tabs[1].click();
    fixture.detectChanges();

    expect(tabs[1].getAttribute('aria-selected')).toBe('true');
    expect(fixture.nativeElement.querySelector('mifosx-loan-account-table')).toBeTruthy();
  });
});
