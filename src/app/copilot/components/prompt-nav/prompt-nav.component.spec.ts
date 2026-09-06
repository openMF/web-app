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

import { PromptNavComponent } from './prompt-nav.component';
import { ChatMessage } from '../../core/models/chat-message.model';

function ask(id: string, content: string): ChatMessage {
  return { id, role: 'user', content, timestamp: 0 };
}

function reply(id: string): ChatMessage {
  return { id, role: 'assistant', content: 'One active loan.', timestamp: 0 };
}

describe('PromptNavComponent', () => {
  let fixture: ComponentFixture<PromptNavComponent>;
  let component: PromptNavComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PromptNavComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PromptNavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  /** With one question there is nowhere to move between, so the rail is only furniture. */
  it('stays away until there is a second question', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'Show me the loan'),
      reply('a-1')
    ]);
    fixture.detectChanges();

    expect(component.hasEntries).toBe(false);
    expect(fixture.nativeElement.querySelector('.prompt-nav')).toBeNull();
  });

  it('lists the questions once there are two', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'Show me the loan'),
      reply('a-1'),
      ask('u-2', 'Who is this client'),
      reply('a-2')
    ]);
    fixture.detectChanges();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('.prompt-nav__label') as NodeListOf<HTMLElement>
    ).map((node) => node.textContent?.trim());
    expect(labels).toEqual([
      'Show me the loan',
      'Who is this client'
    ]);
  });

  it('lists only what the officer asked, never the answers', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'One'),
      reply('a-1'),
      ask('u-2', 'Two'),
      reply('a-2')
    ]);
    expect(component.entries.map((entry) => entry.id)).toEqual([
      'u-1',
      'u-2'
    ]);
  });

  it('numbers the questions in the order they were asked', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'One'),
      ask('u-2', 'Two'),
      ask('u-3', 'Three')
    ]);
    expect(component.entries.map((entry) => entry.index)).toEqual([
      1,
      2,
      3
    ]);
  });

  it('trims a long question on a word boundary', () => {
    const long = 'Show me the repayment schedule for the loan belonging to this particular client';
    fixture.componentRef.setInput('messages', [
      ask('u-1', long),
      ask('u-2', 'Short')
    ]);

    const label = component.entries[0].label;
    expect(label.endsWith('…')).toBe(true);
    expect(label.length).toBeLessThanOrEqual(49);
    expect(label).not.toContain('  ');
    // Cut between words, so the tail is a whole word rather than half of one.
    expect(long).toContain(label.slice(0, -1).trim());
  });

  it('collapses whitespace so a pasted question stays on one line', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'Show me\n\n  the loan'),
      ask('u-2', 'Short')
    ]);
    expect(component.entries[0].label).toBe('Show me the loan');
  });

  it('marks the question whose answer is on screen', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'One'),
      ask('u-2', 'Two')
    ]);
    fixture.componentRef.setInput('activeId', 'u-2');
    fixture.detectChanges();

    const items = fixture.nativeElement.querySelectorAll('.prompt-nav__item');
    expect(items[0].getAttribute('aria-current')).toBeNull();
    expect(items[1].getAttribute('aria-current')).toBe('true');
    expect(items[1].classList).toContain('prompt-nav__item--active');
  });

  it('asks to go back to a question when one is clicked', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'One'),
      ask('u-2', 'Two')
    ]);
    fixture.detectChanges();

    let jumped: string | undefined;
    component.jumpTo.subscribe((id: string) => (jumped = id));
    fixture.nativeElement.querySelectorAll('.prompt-nav__item')[1].click();
    expect(jumped).toBe('u-2');
  });

  it('collapses to a strip of rules and back', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'One'),
      ask('u-2', 'Two')
    ]);
    fixture.detectChanges();

    const toggle = fixture.nativeElement.querySelector('.prompt-nav__toggle');
    expect(toggle.getAttribute('aria-expanded')).toBe('true');

    toggle.click();
    fixture.detectChanges();
    expect(component.collapsed).toBe(true);
    expect(toggle.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.prompt-nav').classList).toContain('prompt-nav--collapsed');
  });

  /** Collapsing must not drop the list: it is what the officer clicks to move about. */
  it('keeps the questions reachable while collapsed', () => {
    fixture.componentRef.setInput('messages', [
      ask('u-1', 'One'),
      ask('u-2', 'Two')
    ]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.prompt-nav__toggle').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('.prompt-nav__item').length).toBe(2);
  });

  it('treats an absent conversation as the same empty list every time', () => {
    fixture.componentRef.setInput('messages', null);
    const first = component.entries;
    fixture.componentRef.setInput('messages', undefined);
    expect(component.entries).toBe(first);
  });
});
