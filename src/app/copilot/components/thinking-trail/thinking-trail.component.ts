/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { TranslateModule } from '@ngx-translate/core';
import { CopilotStep } from '../../core/models/chat-message.model';

/** Below this many seconds the figure carries a decimal, above it does not. */
const DECIMAL_BELOW_SECONDS = 10;

/** One shared empty array, so "no steps" is a stable reference for OnPush. */
const NO_STEPS: CopilotStep[] = [];

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
 *
 * <p>Takes its parts as discrete inputs rather than the whole message, so that a token
 * arriving for the answer does not change any input this component reads and OnPush can skip
 * it entirely. The answer streams several times a second; the trail changes a handful of
 * times per turn.
 */
@Component({
  selector: 'mifosx-thinking-trail',
  imports: [
    CommonModule,
    TranslateModule
  ],
  templateUrl: './thinking-trail.component.html',
  styleUrls: ['./thinking-trail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Mirrors `detailExpand` in organization/investors, the house pattern for a height
    // collapse. mat-expansion-panel is deliberately not used: its chrome fights the bubble.
    trigger('expandBody', [
      state('collapsed', style({ height: '0px', minHeight: '0', opacity: 0 })),
      state('expanded', style({ height: '*', opacity: 1 })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)'))
    ])
  ]
})
export class ThinkingTrailComponent implements OnChanges, OnDestroy {
  /** Identifies the reply this trail belongs to; only used to build the disclosure id. */
  @Input({ required: true }) messageId!: string;

  /**
   * Normalised through a setter so an absent value is always the SAME empty array.
   *
   * <p>OnPush compares input references. A `msg.steps || []` in the parent template would hand
   * this a freshly built array on every check, which is a changed reference every token, which
   * is exactly the re-render this component is shaped to avoid.
   */
  @Input()
  set steps(value: CopilotStep[] | null | undefined) {
    this.stepList = value ?? NO_STEPS;
  }
  get steps(): CopilotStep[] {
    return this.stepList;
  }
  private stepList: CopilotStep[] = NO_STEPS;

  @Input()
  set workingNotes(value: string | null | undefined) {
    this.notesText = value ?? '';
  }
  get workingNotes(): string {
    return this.notesText;
  }
  private notesText = '';
  /** Wall-clock duration of the whole turn, stamped once the turn ends. */
  @Input() turnMs?: number;
  /**
   * How long the model spent writing its notes, which is not the same as the wait.
   *
   * <p>Shown beside the notes rather than in the header. The header figure is the wall clock
   * the officer sat through; this one is a part of it, and putting two durations side by side
   * in the same line would invite reading one as the other.
   */
  @Input() notesElapsedMs?: number;
  /** True while the turn is still running, which changes the wording from past to present. */
  @Input() isStreaming = false;

  /** The live seconds counter, written to directly so a tick never runs change detection. */
  @ViewChild('liveTimer') private liveTimer?: ElementRef<HTMLElement>;

  private readonly zone = inject(NgZone);
  private timerId?: ReturnType<typeof setInterval>;
  private startedAt = 0;

  open = false;

  /**
   * The id this disclosure controls, one per reply.
   *
   * <p>A conversation renders this component once per answer. A fixed id would put the same one
   * on every panel, and each aria-controls would then name several elements at once, which is
   * the situation the attribute exists to avoid.
   */
  get bodyId(): string {
    return `copilot-thinking-${this.messageId}`;
  }

  get notes(): string {
    return (this.workingNotes ?? '').trim();
  }

  get hasAnything(): boolean {
    return this.steps.length > 0 || this.notes.length > 0 || this.isStreaming;
  }

  /** The step in flight, which is what the officer wants to see while waiting. */
  get currentStep(): CopilotStep | null {
    return this.steps.find((step) => !step.done) ?? null;
  }

  /**
   * What to call what is happening right now.
   *
   * <p>Before the first tool call there is still a wait, and it used to be shown by nothing at
   * all: an officer on a slow branch connection saw three dots and no words. A named state is
   * what separates working from hung, so the gap is filled with the one thing that is honestly
   * known at that point — that the assistant is reading the question.
   */
  get liveLabelKey(): string {
    if (this.currentStep) {
      return '';
    }
    return this.notes ? 'copilot.trail.live.thinking' : 'copilot.trail.live.reading';
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
    return this.turnMs ? this.seconds(this.turnMs) : '';
  }

  /** How long the model spent on its notes, for the line that carries them. */
  get notesElapsed(): string {
    return this.notesElapsedMs ? this.seconds(this.notesElapsedMs) : '';
  }

  /** A step that changes a record, which does not look like one that only read. */
  isWrite(step: CopilotStep): boolean {
    return step.readOnly === false;
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
    return value < DECIMAL_BELOW_SECONDS ? `${value.toFixed(1)}s` : `${Math.round(value)}s`;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isStreaming']) {
      this.isStreaming ? this.startTimer() : this.stopTimer();
    }
  }

  ngOnDestroy(): void {
    this.stopTimer();
  }

  toggle(): void {
    this.open = !this.open;
  }

  /**
   * Count the wait up, without involving Angular.
   *
   * <p>A value that changes every second and is bound in the template would ask the framework
   * to check this component, and every component above it, once a second for the whole turn —
   * on top of the checks the answer's own tokens already cause. The interval runs outside the
   * zone and writes to the text node itself, so a tick costs one assignment.
   *
   * <p>Held to whole seconds deliberately. A tenths-place digit changing ten times a second
   * beside a pulsing label is motion for its own sake, and the officer is reading the label.
   */
  private startTimer(): void {
    this.stopTimer();
    this.startedAt = Date.now();
    this.zone.runOutsideAngular(() => {
      this.timerId = setInterval(() => {
        const node = this.liveTimer?.nativeElement;
        if (node) {
          node.textContent = `${Math.floor((Date.now() - this.startedAt) / 1000)}s`;
        }
      }, 1000);
    });
  }

  private stopTimer(): void {
    if (this.timerId !== undefined) {
      clearInterval(this.timerId);
      this.timerId = undefined;
    }
  }
}
