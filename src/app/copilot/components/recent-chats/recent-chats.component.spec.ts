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

import { RecentChatsComponent } from './recent-chats.component';
import { Conversation } from '../../core/models/chat-message.model';
import { SettingsService } from 'app/settings/settings.service';
import { Dates } from 'app/core/utils/dates';

function conversation(id: string, title: string, preview = ''): Conversation {
  return { id, title, preview, timestamp: 0, messageCount: 2 };
}

/** Enough conversations that the search box is worth showing. */
const MANY: Conversation[] = [
  conversation('c-1', 'Préstamo de Rajesh', 'Show me the loan'),
  conversation('c-2', 'Client lookup', 'Who is this client'),
  conversation('c-3', 'Savings balance', 'What is the balance'),
  conversation('c-4', 'Overdue report', 'Which loans are overdue'),
  conversation('c-5', 'Repayment schedule', 'Show the schedule')
];

describe('RecentChatsComponent', () => {
  let fixture: ComponentFixture<RecentChatsComponent>;
  let component: RecentChatsComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        RecentChatsComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: SettingsService, useValue: { language: { code: 'en-US' } } },
        { provide: Dates, useValue: { getMomentLocale: () => 'en' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RecentChatsComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('conversations', MANY);
    fixture.detectChanges();
  });

  it('lists everything saved until something is searched for', () => {
    expect(component.visible.length).toBe(5);
  });

  it('narrows the list to what matches', () => {
    component.onSearch('overdue');
    fixture.detectChanges();

    expect(component.visible.map((conversation) => conversation.id)).toEqual(['c-4']);
  });

  it('searches the preview as well as the title', () => {
    component.onSearch('who is this');
    expect(component.visible.map((conversation) => conversation.id)).toEqual(['c-2']);
  });

  /**
   * An officer typing "prestamo" on a keyboard without accents should still find "Préstamo".
   * A search that only matches perfectly typed accents is one most people conclude is broken.
   */
  it('ignores accents in both the query and the conversation', () => {
    component.onSearch('prestamo');
    expect(component.visible.map((conversation) => conversation.id)).toEqual(['c-1']);
  });

  it('ignores case', () => {
    component.onSearch('CLIENT LOOKUP');
    expect(component.visible.map((conversation) => conversation.id)).toEqual(['c-2']);
  });

  it('says nothing matched, which is not the same as nothing saved', () => {
    component.onSearch('mortgage');
    fixture.detectChanges();

    expect(component.visible.length).toBe(0);
    expect(fixture.nativeElement.querySelector('.recent-chats__empty-title').textContent).toContain(
      'copilot.recent.noMatchTitle'
    );
  });

  it('gives the whole list back when the search is cleared', () => {
    component.onSearch('overdue');
    component.clearSearch();

    expect(component.query).toBe('');
    expect(component.visible.length).toBe(5);
  });

  it('keeps the box away until there are enough chats to be worth searching', () => {
    fixture.componentRef.setInput('conversations', [conversation('c-1', 'Only one')]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.recent-chats__search')).toBeNull();
  });

  it('treats an absent list as the same empty array every time', () => {
    fixture.componentRef.setInput('conversations', null);
    const first = component.conversations;
    fixture.componentRef.setInput('conversations', undefined);
    expect(component.conversations).toBe(first);
  });
});
