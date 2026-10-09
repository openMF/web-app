/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';

import { MessageActionsComponent } from './message-actions.component';
import { ChatMessage } from '../../core/models/chat-message.model';

/** A finished reply, of the shape the chat area renders these actions under. */
function reply(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return {
    id: 'm-1',
    role: 'assistant',
    content: '**Aisha Bello** has one active loan',
    timestamp: 0,
    ...overrides
  };
}

describe('MessageActionsComponent', () => {
  let fixture: ComponentFixture<MessageActionsComponent>;
  let component: MessageActionsComponent;
  let clipboard: { copy: jest.Mock };

  beforeEach(async () => {
    clipboard = { copy: jest.fn(() => true) };
    await TestBed.configureTestingModule({
      imports: [
        MessageActionsComponent,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: Clipboard, useValue: clipboard }]
    }).compileComponents();

    fixture = TestBed.createComponent(MessageActionsComponent);
    component = fixture.componentInstance;
    component.message = reply();
    fixture.detectChanges();
  });

  /** Markdown is for the panel. What leaves it goes into a case note or an email. */
  it('copies the reply as text, without the markup', () => {
    component.copy();

    expect(clipboard.copy).toHaveBeenCalledWith('Aisha Bello has one active loan');
    expect(component.copied).toBe(true);
  });

  it('does not claim to have copied when the clipboard refused', () => {
    clipboard.copy.mockReturnValue(false);

    component.copy();

    expect(component.copied).toBe(false);
  });

  it('asks for the question behind this reply to be put again', () => {
    const asked: string[] = [];
    component.repeatRequested.subscribe((id) => asked.push(id));

    component.repeat();

    expect(asked).toEqual(['m-1']);
  });

  it('rates a reply, and takes the rating back when the same rating is given twice', () => {
    const votes: (string | null)[] = [];
    component.voted.subscribe((vote) => votes.push(vote));

    component.vote('up');
    component.message = reply({ vote: 'up' });
    component.vote('up');
    component.vote('down');

    expect(votes).toEqual([
      'up',
      null,
      'down'
    ]);
  });

  it('asks for this exchange to be filed or passed on, naming the reply and the format', () => {
    const exported: { messageId: string; format: string }[] = [];
    const shared: string[] = [];
    component.exportRequested.subscribe((request) => exported.push(request));
    component.shareRequested.subscribe((id) => shared.push(id));

    component.exportAs('pdf');
    component.share();

    expect(exported).toEqual([{ messageId: 'm-1', format: 'pdf' }]);
    expect(shared).toEqual(['m-1']);
  });

  /** A pending timer that outlives the panel would set a field on a destroyed component. */
  it('drops the copied timer when the message is torn down', () => {
    jest.useFakeTimers();
    component.copy();

    fixture.destroy();
    jest.runAllTimers();

    expect(jest.getTimerCount()).toBe(0);
    jest.useRealTimers();
  });
  describe('offering only the exports that make sense', () => {
    it('leaves a spreadsheet off a reply that is only prose', () => {
      component.message = reply();

      expect(component.exportFormats).toEqual([
        'pdf',
        'png'
      ]);
    });

    it('offers a spreadsheet once the reply has a table in it', () => {
      component.message = reply({
        content: '| Due date | Amount |\n| --- | ---: |\n| 2026-01-05 | 1,000.00 |'
      });

      expect(component.exportFormats).toContain('csv');
    });

    /** One trigger for all of them, so the row does not change width from reply to reply. */
    it('puts every format behind a single menu button', () => {
      // setInput rather than assignment: this component is OnPush, and only setInput marks it
      // dirty, so a plain assignment would assert against the view the previous test rendered.
      fixture.componentRef.setInput(
        'message',
        reply({
          content: '| Due date | Amount |\n| --- | ---: |\n| 2026-01-05 | 1,000.00 |'
        })
      );
      fixture.detectChanges();

      const triggers = fixture.nativeElement.querySelectorAll('[aria-haspopup="menu"]');
      expect(triggers.length).toBe(1);
    });

    it('withholds the export button entirely when there is nothing to export', () => {
      fixture.componentRef.setInput('message', reply({ content: '   ' }));
      fixture.detectChanges();

      expect(component.exportFormats).toEqual([]);
      expect(fixture.nativeElement.querySelector('[aria-haspopup="menu"]')).toBeNull();
    });
  });
});
