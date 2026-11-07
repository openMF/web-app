/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faCopy } from '@fortawesome/free-solid-svg-icons';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { AlertService } from 'app/core/alert/alert.service';
import { AccountNumberComponent } from './account-number.component';

describe('AccountNumberComponent', () => {
  let component: AccountNumberComponent;
  let fixture: ComponentFixture<AccountNumberComponent>;
  let clipboard: { copy: jest.Mock };
  let alertService: { alert: jest.Mock };
  let translateService: TranslateService;

  beforeEach(async () => {
    clipboard = {
      copy: jest.fn()
    };
    alertService = {
      alert: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        AccountNumberComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: Clipboard, useValue: clipboard },
        { provide: AlertService, useValue: alertService }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faCopy);

    translateService = TestBed.inject(TranslateService);
    jest.spyOn(translateService, 'instant').mockImplementation((key: string, params?: { value?: string }) => {
      if (key === 'errors.clipboard.type') {
        return 'Clipboard';
      }
      if (key === 'errors.clipboard.copied') {
        return `Copied: ${params?.value}`;
      }
      if (key === 'errors.clipboard.failed') {
        return 'Failed to copy to clipboard';
      }
      return key;
    });

    fixture = TestBed.createComponent(AccountNumberComponent);
    component = fixture.componentInstance;
    component.accountNo = 'ACC-98765';
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('copyValue', () => {
    it('should display a success notification when copy succeeds (returns true)', () => {
      clipboard.copy.mockReturnValue(true);

      component.copyValue();

      expect(clipboard.copy).toHaveBeenCalledTimes(1);
      expect(clipboard.copy).toHaveBeenCalledWith('ACC-98765');
      expect(alertService.alert).toHaveBeenCalledTimes(1);
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Clipboard',
        message: 'Copied: ACC-98765'
      });
      expect(translateService.instant).toHaveBeenCalledWith('errors.clipboard.type');
      expect(translateService.instant).toHaveBeenCalledWith('errors.clipboard.copied', { value: 'ACC-98765' });
    });

    it('should display an error notification when copy fails (returns false)', () => {
      clipboard.copy.mockReturnValue(false);

      component.copyValue();

      expect(clipboard.copy).toHaveBeenCalledTimes(1);
      expect(clipboard.copy).toHaveBeenCalledWith('ACC-98765');
      expect(alertService.alert).toHaveBeenCalledTimes(1);
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Clipboard',
        message: 'Failed to copy to clipboard'
      });
      expect(translateService.instant).toHaveBeenCalledWith('errors.clipboard.type');
      expect(translateService.instant).toHaveBeenCalledWith('errors.clipboard.failed');
      expect(translateService.instant).not.toHaveBeenCalledWith('errors.clipboard.copied', expect.anything());
    });

    it('should display an error notification when clipboard.copy throws an exception', () => {
      clipboard.copy.mockImplementation(() => {
        throw new Error('Clipboard access denied');
      });

      component.copyValue();

      expect(clipboard.copy).toHaveBeenCalledTimes(1);
      expect(alertService.alert).toHaveBeenCalledTimes(1);
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Clipboard',
        message: 'Failed to copy to clipboard'
      });
      expect(translateService.instant).not.toHaveBeenCalledWith('errors.clipboard.copied', expect.anything());
    });

    it('should ensure success and failure notifications are mutually exclusive', () => {
      clipboard.copy.mockReturnValue(true);
      component.copyValue();

      expect(alertService.alert).toHaveBeenLastCalledWith(expect.objectContaining({ message: 'Copied: ACC-98765' }));

      clipboard.copy.mockReturnValue(false);
      component.copyValue();

      expect(alertService.alert).toHaveBeenLastCalledWith(
        expect.objectContaining({ message: 'Failed to copy to clipboard' })
      );
      expect(alertService.alert).toHaveBeenCalledTimes(2);
    });

    it('should trigger copyValue when user clicks copy button in DOM', () => {
      clipboard.copy.mockReturnValue(true);
      const containerSpan = fixture.nativeElement.querySelector('span');
      containerSpan.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();

      const copyBtn = fixture.nativeElement.querySelector('button.copy-btn');
      expect(copyBtn).toBeTruthy();
      copyBtn.click();

      expect(clipboard.copy).toHaveBeenCalledWith('ACC-98765');
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Clipboard',
        message: 'Copied: ACC-98765'
      });
    });
  });

  describe('account links', () => {
    it('should generate link for loan accounts', () => {
      component.clientId = 10;
      component.accountId = 20;
      component.accountType = '1';

      expect(component.getAccountLink()).toBe('/#/clients/10/loan-accounts/20');
    });

    it('should generate link for savings accounts', () => {
      component.clientId = 10;
      component.accountId = 30;
      component.accountType = '2';

      expect(component.getAccountLink()).toBe('/#/clients/10/savings-accounts/30');
    });

    it('should return empty string when accountType is null', () => {
      component.accountType = null;
      expect(component.getAccountLink()).toBe('');
    });
  });
});
