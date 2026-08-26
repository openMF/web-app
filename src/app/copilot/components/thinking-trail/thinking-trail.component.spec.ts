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

import { ThinkingTrailComponent } from './thinking-trail.component';
import { ChatMessage } from '../../core/models/chat-message.model';

function reply(overrides: Partial<ChatMessage> = {}): ChatMessage {
  return { id: 'm-1', role: 'assistant', content: 'One active loan.', timestamp: 0, ...overrides };
}

describe('ThinkingTrailComponent', () => {
  let fixture: ComponentFixture<ThinkingTrailComponent>;
  let component: ThinkingTrailComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ThinkingTrailComponent,
        TranslateModule.forRoot()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThinkingTrailComponent);
    component = fixture.componentInstance;
    component.message = reply();
    fixture.detectChanges();
  });

  /** A reply that used no tools and produced no notes gets no panel at all. */
  it('shows nothing when there is nothing to show', () => {
    expect(component.hasAnything).toBe(false);
    expect(fixture.nativeElement.querySelector('.trail')).toBeNull();
  });

  it('lists the steps the assistant actually took', () => {
    component.message = reply({
      steps: [
        { label: 'Looked up the client', readOnly: true, done: true, durationMs: 3079 },
        { label: 'Read the loan account', readOnly: true, done: true, durationMs: 412 }
      ]
    });
    fixture.detectChanges();
    component.toggle();
    fixture.detectChanges();

    const labels = Array.from(fixture.nativeElement.querySelectorAll('.trail__step-label')).map((n) =>
      (n as HTMLElement).textContent?.trim()
    );
    expect(labels).toEqual([
      'Looked up the client',
      'Read the loan account'
    ]);
  });

  /** One disclosure, so the officer is not asked to open two things to see one answer. */
  it('puts what it did and what it wrote in the same panel', () => {
    component.message = reply({
      steps: [{ label: 'Looked up the client', readOnly: true, done: true }],
      workingNotes: 'Deciding which tool to use.'
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.trail__summary').length).toBe(1);

    component.toggle();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.trail__step-label')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.trail__notes').textContent).toContain('Deciding which tool');
  });

  /**
   * Reading it has to be a choice. Detailed explanations increase reliance on a recommendation
   * including when it is wrong, so the panel never opens itself.
   */
  it('stays closed until the officer opens it', () => {
    component.message = reply({ workingNotes: 'The officer wants the balance.' });
    fixture.detectChanges();

    expect(component.open).toBe(false);
    expect(fixture.nativeElement.querySelector('.trail__notes')).toBeNull();
  });

  it('reports its open state to a screen reader', () => {
    component.message = reply({ steps: [{ label: 'Looked up the client', readOnly: true, done: true }] });
    fixture.detectChanges();

    const summary = fixture.nativeElement.querySelector('.trail__summary');
    expect(summary.getAttribute('aria-expanded')).toBe('false');

    summary.click();
    fixture.detectChanges();
    expect(summary.getAttribute('aria-expanded')).toBe('true');
  });

  /** The caution belongs with the text, read at the moment the text is. */
  it('carries its caution beside the notes', () => {
    component.message = reply({ workingNotes: 'Deciding which tool to use.' });
    fixture.detectChanges();
    component.toggle();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.trail__caution')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.trail__note')).not.toBeNull();
  });

  /** While the turn runs, the officer needs to tell working apart from hung. */
  it('names the step in flight while streaming', () => {
    component.message = reply({
      steps: [
        { label: 'Looked up the client', readOnly: true, done: true },
        { label: 'Fetching the repayment schedule', readOnly: true, done: false }
      ]
    });
    component.isStreaming = true;
    fixture.detectChanges();

    expect(component.currentStep?.label).toBe('Fetching the repayment schedule');
    expect(fixture.nativeElement.querySelector('.trail__live').textContent).toContain(
      'Fetching the repayment schedule'
    );
    expect(fixture.nativeElement.querySelectorAll('.trail__summary').length).toBe(0);
  });

  /**
   * A turn that spent four seconds thinking and eleven waiting on Fineract took fifteen, and
   * fifteen is the number the officer sat through.
   */
  it('counts the whole turn, not just the thinking', () => {
    component.message = reply({
      notesElapsedMs: 4000,
      steps: [{ label: 'Looked up the client', readOnly: true, done: true, durationMs: 11000 }]
    });

    expect(component.elapsed).toBe('15s');
  });

  it('says a duration in seconds', () => {
    expect(component.seconds(3079)).toBe('3.1s');
    expect(component.seconds(412)).toBe('0.4s');
    expect(component.seconds(23400)).toBe('23s');
    expect(component.seconds(undefined)).toBe('');
  });

  it('shows no duration when nothing was timed', () => {
    component.message = reply({ workingNotes: 'thought' });
    expect(component.elapsed).toBe('');
  });
});
