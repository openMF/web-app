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
import { faCircle, faUser } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import enUs from 'assets/translations/en-US.json';
import frFr from 'assets/translations/fr-FR.json';
import { SettingsService } from 'app/settings/settings.service';

import { ClientNavigationComponent } from './client-navigation.component';
import { LoanAccountTableComponent } from '../loan-account-table/loan-account-table.component';
import { SavingsAccountTableComponent } from '../savings-account-table/savings-account-table.component';
import { ShareAccountTableComponent } from '../share-account-table/share-account-table.component';
import { MemberGroupsComponent } from '../member-groups/member-groups.component';

@Component({ selector: 'mifosx-loan-account-table', standalone: true, template: '' })
class LoanAccountTableStubComponent {
  @Input() loanAccountData: any;
}

@Component({ selector: 'mifosx-savings-account-table', standalone: true, template: '' })
class SavingsAccountTableStubComponent {
  @Input() savingsAccountData: any;
}

@Component({ selector: 'mifosx-share-account-table', standalone: true, template: '' })
class ShareAccountTableStubComponent {
  @Input() shareAccountData: any;
}

@Component({ selector: 'mifosx-member-groups', standalone: true, template: '' })
class MemberGroupsStubComponent {
  @Input() memberGroupData: any;
}

const ENGLISH_LABELS = [
  'Details',
  'Loan Accounts',
  'Savings Accounts',
  'Share Accounts',
  'Group Members'
];
const FRENCH_LABELS = [
  'Détails',
  'Comptes de prêt',
  'Comptes d’épargne',
  'Partager des comptes',
  'Les membres du groupe'
];

describe('ClientNavigationComponent', () => {
  let fixture: ComponentFixture<ClientNavigationComponent>;
  let translate: TranslateService;

  function tabLabels(): string[] {
    return Array.from(fixture.nativeElement.querySelectorAll('[role="tab"]')).map((tab: HTMLElement) =>
      tab.textContent?.trim()
    );
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ClientNavigationComponent,
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
      .overrideComponent(ClientNavigationComponent, {
        remove: { imports: [
            LoanAccountTableComponent,
            SavingsAccountTableComponent,
            ShareAccountTableComponent,
            MemberGroupsComponent
          ] },
        add: {
          imports: [
            LoanAccountTableStubComponent,
            SavingsAccountTableStubComponent,
            ShareAccountTableStubComponent,
            MemberGroupsStubComponent
          ]
        }
      })
      .compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faUser, faCircle);

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en-US', enUs);
    translate.setTranslation('fr-FR', frFr);
    translate.use('en-US');

    fixture = TestBed.createComponent(ClientNavigationComponent);
    fixture.componentInstance.clientData = {
      displayName: 'Jane Doe',
      accountNo: '0001',
      status: { code: 'clientStatusType.active', value: 'Active' },
      groups: [{ id: 1, name: 'Group One' }]
    };
    fixture.componentInstance.clientAccountsData = {
      loanAccounts: [{ id: 1 }],
      savingsAccounts: [{ id: 2 }],
      shareAccounts: [{ id: 3 }]
    };
    fixture.detectChanges();
  });

  it('renders the five profile tab labels in English', () => {
    expect(tabLabels()).toEqual(ENGLISH_LABELS);
  });

  it('renders the five profile tab labels in French', () => {
    translate.use('fr-FR');
    fixture.detectChanges();

    expect(tabLabels()).toEqual(FRENCH_LABELS);
  });

  it('updates the tab labels when the language changes without recreating the component', () => {
    translate.use('fr-FR');
    fixture.detectChanges();
    expect(tabLabels()).toEqual(FRENCH_LABELS);

    translate.use('en-US');
    fixture.detectChanges();
    expect(tabLabels()).toEqual(ENGLISH_LABELS);

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
