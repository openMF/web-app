/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { ChatAreaComponent } from './chat-area.component';
import { ChatMessage } from '../../core/models/chat-message.model';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

/** A conversation of `pairs` question-and-answer exchanges, oldest first. */
function conversation(pairs: number): ChatMessage[] {
  const messages: ChatMessage[] = [];
  for (let i = 0; i < pairs; i++) {
    messages.push({ id: `u-${i}`, role: 'user', content: `Question ${i}`, timestamp: 0 });
    messages.push({ id: `a-${i}`, role: 'assistant', content: `Answer ${i}`, timestamp: 0 });
  }
  return messages;
}

describe('ChatAreaComponent', () => {
  let fixture: ComponentFixture<ChatAreaComponent>;
  let component: ChatAreaComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ChatAreaComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SettingsService, useValue: { language: { code: 'en-US' } } },
        { provide: Dates, useValue: { getMomentLocale: () => 'en' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatAreaComponent);
    component = fixture.componentInstance;
  });

  describe('windowing a long conversation', () => {
    it('renders a short conversation whole, with nothing held back', () => {
      fixture.componentRef.setInput('messages', conversation(3));
      fixture.detectChanges();

      expect(component.hiddenCount).toBe(0);
      expect(component.visibleMessages.length).toBe(6);
      expect(fixture.nativeElement.querySelector('.show-earlier')).toBeNull();
    });

    it('holds back the oldest messages once the conversation is long', () => {
      fixture.componentRef.setInput('messages', conversation(40));
      fixture.detectChanges();

      expect(component.hiddenCount).toBeGreaterThan(0);
      expect(component.visibleMessages.length).toBeLessThan(80);
      expect(fixture.nativeElement.querySelector('.show-earlier')).not.toBeNull();
    });

    /** Starting the window on a reply orphans it, which reads as the assistant speaking first. */
    it('never starts the window on an answer', () => {
      fixture.componentRef.setInput('messages', conversation(40));
      fixture.detectChanges();
      expect(component.visibleMessages[0].role).toBe('user');
    });

    it('always keeps the newest exchange', () => {
      const messages = conversation(40);
      fixture.componentRef.setInput('messages', messages);
      fixture.detectChanges();
      expect(component.visibleMessages[component.visibleMessages.length - 1].id).toBe(messages[79].id);
    });

    it('reveals the rest when asked, and says it did', () => {
      fixture.componentRef.setInput('messages', conversation(40));
      fixture.detectChanges();
      expect(component.revealEarlier()).toBe(true);

      expect(component.hiddenCount).toBe(0);
      expect(component.visibleMessages.length).toBe(80);
    });

    it('has nothing to reveal in a short conversation', () => {
      fixture.componentRef.setInput('messages', conversation(2));
      fixture.detectChanges();
      expect(component.revealEarlier()).toBe(false);
    });

    it('windows again for a new, shorter conversation', () => {
      fixture.componentRef.setInput('messages', conversation(40));
      fixture.detectChanges();
      component.revealEarlier();
      // Starting a new chat replaces the list with a shorter one.
      fixture.componentRef.setInput('messages', conversation(1));
      fixture.detectChanges();
      expect(component.hiddenCount).toBe(0);

      fixture.componentRef.setInput('messages', conversation(40));
      fixture.detectChanges();
      expect(component.hiddenCount).toBeGreaterThan(0);
    });
  });

  describe('what a screen reader is told', () => {
    it('says it is working while the reply streams', () => {
      fixture.componentRef.setInput('messages', conversation(1));
      fixture.detectChanges();
      fixture.componentRef.setInput('isStreaming', true);
      fixture.detectChanges();

      const status = fixture.nativeElement.querySelector('[role="status"]');
      expect(status.textContent).toContain('copilot.a11y.working');
    });

    it('says the reply is ready once it has finished', () => {
      fixture.componentRef.setInput('messages', conversation(1));
      fixture.detectChanges();
      fixture.componentRef.setInput('isStreaming', false);
      fixture.detectChanges();

      expect(component.lastReplyDone).toBe(true);
      expect(fixture.nativeElement.querySelector('[role="status"]').textContent).toContain('copilot.a11y.replyReady');
    });

    it('says nothing when the assistant has not answered yet', () => {
      fixture.componentRef.setInput('messages', [
        { id: 'u-1', role: 'user', content: 'Hello', timestamp: 0 } as ChatMessage
      ]);
      expect(component.lastReplyDone).toBe(false);
    });
  });
});
