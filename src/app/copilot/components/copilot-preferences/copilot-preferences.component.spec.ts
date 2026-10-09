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

import { CopilotPreferencesComponent } from './copilot-preferences.component';

describe('CopilotPreferencesComponent', () => {
  let fixture: ComponentFixture<CopilotPreferencesComponent>;
  let component: CopilotPreferencesComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CopilotPreferencesComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CopilotPreferencesComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('savedConversations', 3);
    fixture.detectChanges();
  });

  /** This is the tab that used to render a heading and nothing under it. */
  it('offers settings that do something', () => {
    const switches = fixture.nativeElement.querySelectorAll('.prefs__switch[role="switch"]');

    expect(switches.length).toBe(2);
  });

  it('reports the switches as on or off for a screen reader', () => {
    fixture.componentRef.setInput('isFullScreen', true);
    fixture.componentRef.setInput('historyEnabled', false);
    fixture.detectChanges();

    const switches = fixture.nativeElement.querySelectorAll('.prefs__switch');
    expect(switches[0].getAttribute('aria-checked')).toBe('true');
    expect(switches[1].getAttribute('aria-checked')).toBe('false');
  });

  it('asks the panel to turn on-device history off, rather than deciding by itself', () => {
    const asked: boolean[] = [];
    component.historyToggled.subscribe((enabled) => asked.push(enabled));

    fixture.nativeElement.querySelectorAll('.prefs__switch')[1].click();

    expect(asked).toEqual([false]);
  });

  describe('erasing saved chats', () => {
    /** It cannot be undone, so the first press only arms the button. */
    it('does not erase on the first press', () => {
      let erased = 0;
      component.historyCleared.subscribe(() => erased++);

      component.requestClear();

      expect(erased).toBe(0);
      expect(component.confirmingClear).toBe(true);
    });

    it('erases on the second', () => {
      let erased = 0;
      component.historyCleared.subscribe(() => erased++);

      component.requestClear();
      component.requestClear();

      expect(erased).toBe(1);
      expect(component.confirmingClear).toBe(false);
    });

    it('lets the officer back out', () => {
      let erased = 0;
      component.historyCleared.subscribe(() => erased++);

      component.requestClear();
      component.cancelClear();
      component.requestClear();

      expect(erased).toBe(0);
    });

    it('offers nothing to erase when nothing is saved', () => {
      fixture.componentRef.setInput('savedConversations', 0);
      fixture.detectChanges();

      const button = fixture.nativeElement.querySelector('.prefs__button--danger');
      expect(button.disabled).toBe(true);
    });
  });
});
