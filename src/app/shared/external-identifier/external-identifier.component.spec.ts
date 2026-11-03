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
import { faCopy, faEye } from '@fortawesome/free-solid-svg-icons';
import { TranslateService } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

import { AlertService } from 'app/core/alert/alert.service';
import { ExternalIdentifierComponent } from './external-identifier.component';

describe('ExternalIdentifierComponent', () => {
  let component: ExternalIdentifierComponent;
  let fixture: ComponentFixture<ExternalIdentifierComponent>;
  let clipboard: { copy: jest.Mock };
  let alertService: { alert: jest.Mock };
  let translateService: { instant: jest.Mock };

  beforeEach(async () => {
    clipboard = {
      copy: jest.fn()
    };
    alertService = {
      alert: jest.fn()
    };
    translateService = {
      instant: jest.fn((key: string, params?: { value?: string }) => {
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
      })
    };

    await TestBed.configureTestingModule({
      imports: [ExternalIdentifierComponent],
      providers: [
        { provide: Clipboard, useValue: clipboard },
        { provide: AlertService, useValue: alertService },
        { provide: TranslateService, useValue: translateService }
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faCopy, faEye);

    fixture = TestBed.createComponent(ExternalIdentifierComponent);
    component = fixture.componentInstance;
    component.externalId = 'EXT-12345';
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
      expect(clipboard.copy).toHaveBeenCalledWith('EXT-12345');
      expect(alertService.alert).toHaveBeenCalledTimes(1);
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Clipboard',
        message: 'Copied: EXT-12345'
      });
      expect(translateService.instant).toHaveBeenCalledWith('errors.clipboard.type');
      expect(translateService.instant).toHaveBeenCalledWith('errors.clipboard.copied', { value: 'EXT-12345' });
    });

    it('should display an error notification when copy fails (returns false)', () => {
      clipboard.copy.mockReturnValue(false);

      component.copyValue();

      expect(clipboard.copy).toHaveBeenCalledTimes(1);
      expect(clipboard.copy).toHaveBeenCalledWith('EXT-12345');
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
        throw new Error('Clipboard write permission denied');
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

    it('should not copy or show any notification when hideCopy is true', () => {
      component.hideCopy = true;

      component.copyValue();

      expect(clipboard.copy).not.toHaveBeenCalled();
      expect(alertService.alert).not.toHaveBeenCalled();
    });

    it('should trigger copyValue when user clicks copy icon in DOM', () => {
      clipboard.copy.mockReturnValue(true);
      const containerSpan = fixture.nativeElement.querySelector('span');
      containerSpan.dispatchEvent(new Event('mouseenter'));
      fixture.detectChanges();

      const copyIcon = fixture.nativeElement.querySelector('fa-icon[icon="copy"]');
      expect(copyIcon).toBeTruthy();
      copyIcon.closest('span').click();

      expect(clipboard.copy).toHaveBeenCalledWith('EXT-12345');
      expect(alertService.alert).toHaveBeenCalledWith({
        type: 'Clipboard',
        message: 'Copied: EXT-12345'
      });
    });
  });
});
