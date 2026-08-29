/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ChatMessage, CopilotStep } from '../../core/models/chat-message.model';

/**
 * How the assistant reached an answer, in two parts that are not the same kind of thing.
 *
 * <p><b>Steps taken</b> is a record. Each entry is a call the gateway made, named by the tool
 * manifest rather than by a model, so it says what happened and says the same thing every time.
 * This is the part that can honestly be called an explanation.
 *
 * <p><b>Working notes</b> is the text the model wrote while working. It is shown because an
 * officer scrutinising a surprising answer deserves to see it, and it is labelled carefully
 * because it is not evidence of anything. A model's stated reasoning is frequently not why it
 * answered as it did, so presenting it as the basis for a lending decision would be a claim
 * nobody can stand behind.
 *
 * <p>Both sit below the answer and both start closed. Above the answer they would frame it
 * before it is read, and detailed explanations are known to increase reliance on a
 * recommendation including when the recommendation is wrong. Below, opening one is an act of
 * scrutiny rather than a preamble.
 */
@Component({
  selector: 'mifosx-thinking-trail',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './thinking-trail.component.html',
  styleUrls: ['./thinking-trail.component.scss']
})
export class ThinkingTrailComponent {
  @Input({ required: true }) message!: ChatMessage;
  /** True while the turn is still running, which changes the wording from past to present. */
  @Input() isStreaming = false;

  open = false;

  /**
   * The id this disclosure controls, one per reply.
   *
   * <p>A conversation renders this component once per answer. A fixed id would put the same one
   * on every panel, and each aria-controls would then name several elements at once, which is
   * the situation the attribute exists to avoid.
   */
  get bodyId(): string {
    return `copilot-thinking-${this.message.id}`;
  }

  get steps(): CopilotStep[] {
    return this.message.steps ?? [];
  }

  get notes(): string {
    return (this.message.workingNotes ?? '').trim();
  }

  get hasAnything(): boolean {
    return this.steps.length > 0 || this.notes.length > 0;
  }

  /** The step in flight, which is what the officer wants to see while waiting. */
  get currentStep(): CopilotStep | null {
    return this.steps.find((step) => !step.done) ?? null;
  }

  get finishedCount(): number {
    return this.steps.filter((step) => step.done).length;
  }

  /**
   * How long the officer waited, wall clock.
   *
   * <p>Taken from the turn itself rather than summed from its parts. Adding the model's timer
   * to each call's duration counts any overlap between the two twice and leaves out the time
   * spent streaming the answer, so the figure could be wrong in both directions at once. What
   * is wanted here is the wait, and the wait is from when the turn started to when it ended.
   */
  get elapsed(): string {
    return this.message.turnMs ? this.seconds(this.message.turnMs) : '';
  }

  /**
   * Seconds, to one decimal below ten.
   *
   * <p>Not a bare millisecond count: 8567 is a number an officer has to convert before it
   * means anything, and the point of showing a duration is that it means something at a glance.
   */
  seconds(ms: number | undefined): string {
    if (ms == null) {
      return '';
    }
    const value = ms / 1000;
    return value < 10 ? `${value.toFixed(1)}s` : `${Math.round(value)}s`;
  }

  toggle(): void {
    this.open = !this.open;
  }
}
