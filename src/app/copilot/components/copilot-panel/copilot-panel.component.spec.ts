/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DatePipe } from '@angular/common';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { CopilotPanelComponent } from './copilot-panel.component';
import { ChatService } from '../../services/chat.service';
import { AiContextService } from '../../services/ai-context.service';
import { CopilotExportService } from '../../services/copilot-export.service';
import { CopilotFeatureService } from '../../services/copilot-feature.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { ChatMessage } from '../../core/models/chat-message.model';

const REPLY: ChatMessage = { id: 'm-2', role: 'assistant', content: 'One active loan.', timestamp: 0 };
const QUESTION: ChatMessage = { id: 'm-1', role: 'user', content: 'how many loans?', timestamp: 0 };

describe('CopilotPanelComponent', () => {
  let fixture: ComponentFixture<CopilotPanelComponent>;
  let component: CopilotPanelComponent;
  let chat: {
    messages$: BehaviorSubject<ChatMessage[]>;
    conversations$: BehaviorSubject<unknown[]>;
    isStreaming$: BehaviorSubject<boolean>;
    pendingAction$: BehaviorSubject<null>;
    loadHistory: jest.Mock;
    exchangeFor: jest.Mock;
    setVote: jest.Mock;
    repeat: jest.Mock;
    sendMessage: jest.Mock;
    historyEnabled: jest.Mock;
    setHistoryEnabled: jest.Mock;
    clearAllHistory: jest.Mock;
  };
  let exporter: { exportToPdf: jest.Mock; share: jest.Mock };
  /** Stands in for the one preference this panel keeps; the suite stubs storage out. */
  let stored: string | null = null;
  let snackBar: { open: jest.Mock };

  function build(): void {
    fixture = TestBed.createComponent(CopilotPanelComponent);
    component = fixture.componentInstance;
    fixture.autoDetectChanges(true);
  }

  beforeEach(() => {
    stored = null;
    (localStorage.getItem as jest.Mock).mockImplementation(() => stored);
    (localStorage.setItem as jest.Mock).mockImplementation((...args: unknown[]) => {
      stored = args[1] as string;
    });
    chat = {
      messages$: new BehaviorSubject<ChatMessage[]>([]),
      conversations$: new BehaviorSubject<unknown[]>([]),
      isStreaming$: new BehaviorSubject<boolean>(false),
      pendingAction$: new BehaviorSubject<null>(null),
      loadHistory: jest.fn(),
      exchangeFor: jest.fn(() => ({ question: QUESTION, reply: REPLY })),
      setVote: jest.fn(),
      repeat: jest.fn(),
      sendMessage: jest.fn(() => true),
      historyEnabled: jest.fn(() => true),
      setHistoryEnabled: jest.fn(),
      clearAllHistory: jest.fn()
    };
    exporter = {
      exportToPdf: jest.fn(() => Promise.resolve()),
      share: jest.fn(() => Promise.resolve('copied'))
    };
    snackBar = { open: jest.fn() };

    TestBed.configureTestingModule({
      imports: [
        CopilotPanelComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        DatePipe,
        { provide: ChatService, useValue: chat },
        { provide: CopilotExportService, useValue: exporter },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: CopilotFeatureService, useValue: { shouldShowPanel: () => true } },
        {
          provide: AiContextService,
          useValue: {
            context$: EMPTY,
            getContextSnapshot: () => ({ clientName: 'Aisha Bello', clientId: 42 }),
            currentRoute: () => '/clients/42'
          }
        },
        {
          provide: AuthenticationService,
          useValue: { isAuthenticated$: of(true), getCredentials: () => ({ username: 'priya' }) }
        }
      ]
    });
    build();
  });

  describe('full screen', () => {
    it('starts framed inside the shell', () => {
      expect(component.isFullScreen).toBe(false);
    });

    it('fills the window when asked, and drops the frame that was in the way', async () => {
      // Driven through the controls an officer actually uses. The panel is OnPush, and a
      // template event is what marks it dirty; state poked in from a test never repaints.
      fixture.nativeElement.querySelector('.ai-fab').click();
      await fixture.whenStable();
      fixture.nativeElement.querySelectorAll('.topbar__btn')[0].click();
      await fixture.whenStable();

      const page = fixture.nativeElement.querySelector('.chat-page');
      expect(page.classList).toContain('chat-page--full');
      expect(page.classList).not.toContain('chat-page--sidebar-full');
    });

    /** An officer who works full screen works that way all day, not once per open. */
    it('remembers the choice for next time', () => {
      component.toggleFullScreen();

      build();

      expect(localStorage.setItem).toHaveBeenCalledWith('mifosXCopilotFullScreen', 'true');
      expect(component.isFullScreen).toBe(true);
    });

    it('gives the space back when asked again', () => {
      component.toggleFullScreen();
      component.toggleFullScreen();

      build();

      expect(component.isFullScreen).toBe(false);
    });

    /** Storage can be off entirely. That costs the memory, not the panel. */
    it('opens framed when the preference cannot be read', () => {
      (localStorage.getItem as jest.Mock).mockImplementation(() => {
        throw new Error('storage disabled');
      });

      build();

      expect(component.isFullScreen).toBe(false);
    });
  });

  describe('the composer', () => {
    it('empties once a question is on its way', () => {
      component.composerText = 'how many loans does aisha have';

      component.sendMessage(component.composerText);

      expect(component.composerText).toBe('');
    });

    /** Complaining about text the officer can no longer read is the worst of both. */
    it('keeps the question when it was refused', () => {
      chat.sendMessage.mockReturnValue(false);
      component.composerText = 'a question the sanitiser did not like';

      component.sendMessage(component.composerText);

      expect(component.composerText).toBe('a question the sanitiser did not like');
    });
  });

  describe('preferences', () => {
    it('renders the tab as settings rather than a heading with nothing under it', async () => {
      fixture.nativeElement.querySelector('.ai-fab').click();
      await fixture.whenStable();
      const tabs = Array.from(fixture.nativeElement.querySelectorAll('.bottom-nav__item') as NodeListOf<HTMLElement>);
      tabs.find((tab) => tab.textContent?.includes('preferences'))?.click();
      await fixture.whenStable();

      const switches = fixture.nativeElement.querySelectorAll('.prefs__switch[role="switch"]');
      expect(switches.length).toBeGreaterThan(0);
    });

    it('reflects what the service says about on-device history', () => {
      chat.historyEnabled.mockReturnValue(false);

      build();

      expect(component.historyEnabled).toBe(false);
    });

    it('turning history off tells the service, which is what erases what is stored', () => {
      chat.setHistoryEnabled.mockImplementation(() => chat.historyEnabled.mockReturnValue(false));

      component.setHistoryEnabled(false);

      expect(chat.setHistoryEnabled).toHaveBeenCalledWith(false);
      expect(component.historyEnabled).toBe(false);
    });

    it('erasing saved chats goes through the service', () => {
      component.clearAllHistory();

      expect(chat.clearAllHistory).toHaveBeenCalled();
    });
  });

  describe('reply actions', () => {
    it('files an exchange with who asked and which client it was about', async () => {
      await component.exportExchange('m-2');

      expect(exporter.exportToPdf).toHaveBeenCalledWith(
        expect.objectContaining({ question: QUESTION, reply: REPLY, askedBy: 'priya', clientName: 'Aisha Bello' })
      );
    });

    it('says so when an export could not be produced, rather than looking like a blocked download', async () => {
      exporter.exportToPdf.mockReturnValue(Promise.reject(new Error('canvas failed')));

      await component.exportExchange('m-2');

      expect(snackBar.open).toHaveBeenCalled();
    });

    /** A clipboard write changes nothing on screen, so it has to be announced. */
    it('announces a share that fell back to the clipboard', async () => {
      await component.shareExchange('m-2');

      expect(snackBar.open).toHaveBeenCalled();
    });

    it('stays quiet when the officer used their own share sheet', async () => {
      exporter.share.mockReturnValue(Promise.resolve('shared'));

      await component.shareExchange('m-2');

      expect(snackBar.open).not.toHaveBeenCalled();
    });

    it('does nothing for a reply that has since gone', async () => {
      chat.exchangeFor.mockReturnValue(null);

      await component.exportExchange('gone');
      await component.shareExchange('gone');

      expect(exporter.exportToPdf).not.toHaveBeenCalled();
      expect(exporter.share).not.toHaveBeenCalled();
    });
  });
});
