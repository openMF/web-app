/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, jest, afterEach } from '@jest/globals';

import { ThinkingTrailComponent } from './thinking-trail.component';
import { CopilotStep } from '../../core/models/chat-message.model';

function step(label: string, done = true, durationMs?: number): CopilotStep {
  return { label, readOnly: true, done, durationMs };
}

describe('ThinkingTrailComponent', () => {
  let fixture: ComponentFixture<ThinkingTrailComponent>;
  let component: ThinkingTrailComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ThinkingTrailComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThinkingTrailComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('messageId', 'm-1');
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  /** A finished reply that used no tools and produced no notes gets no panel at all. */
  it('shows nothing when there is nothing to show', () => {
    expect(component.hasAnything).toBe(false);
    expect(fixture.nativeElement.querySelector('.trail')).toBeNull();
  });

  it('lists the steps the assistant actually took', () => {
    fixture.componentRef.setInput('steps', [
      step('Reading the loan account'),
      step('Checking the repayment schedule')
    ]);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.trail__summary').click();
    fixture.detectChanges();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('.trail__step-label') as NodeListOf<HTMLElement>
    ).map((node) => node.textContent?.trim());
    expect(labels).toEqual([
      'Reading the loan account',
      'Checking the repayment schedule'
    ]);
  });

  // ─── State transitions ─────────────────────────────────────────────────────

  it('shows the live line while streaming and the disclosure once complete', () => {
    fixture.componentRef.setInput('isStreaming', true);
    fixture.componentRef.setInput('steps', [step('Reading the loan account', false)]);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.trail__live')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.trail__summary')).toBeNull();

    fixture.componentRef.setInput('isStreaming', false);
    fixture.componentRef.setInput('turnMs', 3200);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.trail__live')).toBeNull();
    expect(fixture.nativeElement.querySelector('.trail__summary')).not.toBeNull();
  });

  /**
   * The gap before the first tool call is a wait like any other. It used to render nothing,
   * which is the state an officer cannot tell apart from a hung panel.
   */
  it('names the wait even before the first step arrives', () => {
    fixture.componentRef.setInput('isStreaming', true);
    fixture.detectChanges();

    expect(component.currentStep).toBeNull();
    expect(component.liveLabelKey).toBe('copilot.trail.live.reading');
    expect(fixture.nativeElement.querySelector('.trail__live')).not.toBeNull();
  });

  it('says it is thinking once notes have started arriving', () => {
    fixture.componentRef.setInput('isStreaming', true);
    fixture.componentRef.setInput('workingNotes', 'Checking the schedule before quoting a figure.');
    fixture.detectChanges();

    expect(component.liveLabelKey).toBe('copilot.trail.live.thinking');
  });

  it('names the step in flight while streaming', () => {
    fixture.componentRef.setInput('isStreaming', true);
    fixture.componentRef.setInput('steps', [
      step('Reading the loan account'),
      step('Checking the repayment schedule', false)
    ]);
    fixture.detectChanges();

    expect(component.currentStep?.label).toBe('Checking the repayment schedule');
    expect(fixture.nativeElement.querySelector('.trail__live-label').textContent).toContain(
      'Checking the repayment schedule'
    );
  });

  // ─── Collapsed by default ──────────────────────────────────────────────────

  it('is collapsed when the turn completes', () => {
    fixture.componentRef.setInput('steps', [step('Reading the loan account')]);
    fixture.componentRef.setInput('turnMs', 4100);
    fixture.detectChanges();

    expect(component.open).toBe(false);
    expect(fixture.nativeElement.querySelector('.trail__summary').getAttribute('aria-expanded')).toBe('false');
  });

  it('stays closed until the officer opens it', () => {
    fixture.componentRef.setInput('steps', [step('Reading the loan account')]);
    fixture.detectChanges();
    expect(component.open).toBe(false);

    fixture.nativeElement.querySelector('.trail__summary').click();
    fixture.detectChanges();
    expect(component.open).toBe(true);
  });

  it('reports its open state to a screen reader', () => {
    fixture.componentRef.setInput('steps', [step('Reading the loan account')]);
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('.trail__summary');

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(button.getAttribute('aria-controls')).toBe('copilot-thinking-m-1');

    fixture.nativeElement.querySelector('.trail__summary').click();
    fixture.detectChanges();
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });

  it('gives each reply its own disclosure id', () => {
    fixture.componentRef.setInput('messageId', 'm-2');
    expect(component.bodyId).toBe('copilot-thinking-m-2');
  });

  it('carries its caution beside the notes', () => {
    fixture.componentRef.setInput('workingNotes', 'It looked overdue at first glance.');
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.trail__summary').click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.trail__caution')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.trail__notes').textContent).toContain('overdue');
  });

  // ─── Elapsed-time formatting ───────────────────────────────────────────────

  it('says a duration in seconds', () => {
    expect(component.seconds(3200)).toBe('3.2s');
    expect(component.seconds(800)).toBe('0.8s');
  });

  it('drops the decimal once the wait passes ten seconds', () => {
    expect(component.seconds(9900)).toBe('9.9s');
    expect(component.seconds(10_000)).toBe('10s');
    expect(component.seconds(64_400)).toBe('64s');
  });

  it('shows no duration when nothing was timed', () => {
    expect(component.seconds(undefined)).toBe('');
    expect(component.elapsed).toBe('');
  });

  it('shows the wait the officer actually sat through', () => {
    fixture.componentRef.setInput('turnMs', 8567);
    expect(component.elapsed).toBe('8.6s');
  });

  // ─── The live counter ──────────────────────────────────────────────────────

  /**
   * The counter is written to the text node rather than bound, so that a tick never runs
   * change detection. This checks the writing actually happens.
   */
  it('counts the wait up without binding a ticking value', () => {
    jest.useFakeTimers();
    fixture.componentRef.setInput('isStreaming', true);
    component.ngOnChanges({
      isStreaming: { currentValue: true, previousValue: false, firstChange: false, isFirstChange: () => false }
    });
    fixture.detectChanges();

    jest.advanceTimersByTime(3000);
    expect(fixture.nativeElement.querySelector('.trail__live-time').textContent).toBe('3s');
  });

  it('stops counting when the turn ends', () => {
    jest.useFakeTimers();
    const cleared = jest.spyOn(globalThis, 'clearInterval');
    fixture.componentRef.setInput('isStreaming', true);
    fixture.detectChanges();
    jest.advanceTimersByTime(2000);

    fixture.componentRef.setInput('isStreaming', false);
    fixture.detectChanges();

    expect(cleared).toHaveBeenCalled();
    cleared.mockRestore();
  });

  // ─── Input normalisation (what keeps OnPush from re-checking) ──────────────

  it('treats an absent step list as the same empty array every time', () => {
    fixture.componentRef.setInput('steps', undefined);
    const first = component.steps;
    fixture.componentRef.setInput('steps', undefined);
    expect(component.steps).toBe(first);
  });

  it('treats absent notes as an empty string', () => {
    fixture.componentRef.setInput('workingNotes', undefined);
    expect(component.workingNotes).toBe('');
    expect(component.notes).toBe('');
  });
});
