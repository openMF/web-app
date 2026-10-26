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
  /**
   * The regression this suite exists to hold. Two indicators used to answer two different
   * questions about the same turn, and both were true for the whole gap between asking and the
   * first token. Against a hosted model that gap is a second; against a local one that reasons
   * first it is most of the wait, and the officer watched a bouncing typing indicator and a
   * pulsing thinking line at the same time.
   */
  describe('showing progress exactly once', () => {
    /** A turn that has been asked and has produced nothing yet. */
    function waiting(): ChatMessage[] {
      return [
        { id: 'u-1', role: 'user', content: 'How many loans?', timestamp: 0 },
        { id: 'a-1', role: 'assistant', content: '', timestamp: 0, isStreaming: true }
      ];
    }

    it('draws one indicator while waiting, not two', () => {
      fixture.componentRef.setInput('messages', waiting());
      fixture.componentRef.setInput('isStreaming', true);
      fixture.componentRef.setInput('turnPhase', 'thinking');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelectorAll('.trail__live').length).toBe(1);
      expect(fixture.nativeElement.querySelector('.typing')).toBeNull();
    });

    it('keeps the avatar in place when the first token lands, so nothing jumps', () => {
      fixture.componentRef.setInput('messages', waiting());
      fixture.componentRef.setInput('isStreaming', true);
      fixture.componentRef.setInput('turnPhase', 'thinking');
      fixture.detectChanges();

      const waitingAvatars = fixture.nativeElement.querySelectorAll('.msg__avatar');
      expect(waitingAvatars.length).toBe(1);
      expect(waitingAvatars[0].classList).toContain('msg__avatar--thinking');

      fixture.componentRef.setInput('messages', [
        { id: 'u-1', role: 'user', content: 'How many loans?', timestamp: 0 },
        { id: 'a-1', role: 'assistant', content: 'One active loan.', timestamp: 0, isStreaming: true }
      ]);
      fixture.componentRef.setInput('turnPhase', 'streaming');
      fixture.detectChanges();

      const streamingAvatars = fixture.nativeElement.querySelectorAll('.msg__avatar');
      expect(streamingAvatars.length).toBe(1);
      expect(streamingAvatars[0].classList).not.toContain('msg__avatar--thinking');
      // Still animated, but as answering rather than waiting: the icon keeps saying the
      // assistant is busy without claiming it is still queueing.
      expect(streamingAvatars[0].classList).toContain('msg__avatar--streaming');
    });

    /** The two working states are drawn differently, and a settled reply is drawn as neither. */
    it('leaves the avatar unmarked once the reply has landed', () => {
      fixture.componentRef.setInput('messages', [
        { id: 'u-1', role: 'user', content: 'How many loans?', timestamp: 0 },
        { id: 'a-1', role: 'assistant', content: 'One active loan.', timestamp: 0 }
      ]);
      fixture.componentRef.setInput('isStreaming', false);
      fixture.componentRef.setInput('turnPhase', 'idle');
      fixture.detectChanges();

      const settled = fixture.nativeElement.querySelector('.msg__avatar');
      expect(settled.classList).not.toContain('msg__avatar--thinking');
      expect(settled.classList).not.toContain('msg__avatar--streaming');
    });

    /** Words arriving are their own progress; a live label over them claims otherwise. */
    it('drops the live line once the answer is arriving with no tool call running', () => {
      fixture.componentRef.setInput('messages', [
        { id: 'u-1', role: 'user', content: 'How many loans?', timestamp: 0 },
        { id: 'a-1', role: 'assistant', content: 'One active loan.', timestamp: 0, isStreaming: true }
      ]);
      fixture.componentRef.setInput('isStreaming', true);
      fixture.componentRef.setInput('turnPhase', 'streaming');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.trail__live')).toBeNull();
    });

    it('brings the live line back for a tool call that starts mid-answer', () => {
      fixture.componentRef.setInput('messages', [
        { id: 'u-1', role: 'user', content: 'How many loans?', timestamp: 0 },
        {
          id: 'a-1',
          role: 'assistant',
          content: 'Checking that now.',
          timestamp: 0,
          isStreaming: true,
          steps: [
            { label: 'Reading the loan account', readOnly: true, done: false }
          ]
        }
      ]);
      fixture.componentRef.setInput('isStreaming', true);
      fixture.componentRef.setInput('turnPhase', 'streaming');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.trail__live')).not.toBeNull();
    });

    it('shows no live indicator at all once the turn is over', () => {
      fixture.componentRef.setInput('messages', conversation(1));
      fixture.componentRef.setInput('isStreaming', false);
      fixture.componentRef.setInput('turnPhase', 'idle');
      fixture.detectChanges();

      expect(fixture.nativeElement.querySelector('.trail__live')).toBeNull();
      expect(fixture.nativeElement.querySelector('.typing')).toBeNull();
    });
  });
});
