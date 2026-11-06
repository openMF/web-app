/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Component, TemplateRef, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';

import { PopoverRef } from './popover-ref';
import { PopoverService } from './popover.service';

@Component({
  template: `
    <button #target>Target</button>
    <ng-template #content><p class="popover-content">Step</p></ng-template>
  `
})
class HostComponent {
  @ViewChild('target', { static: true }) target: { nativeElement: HTMLElement };
  @ViewChild('content', { static: true }) content: TemplateRef<unknown>;
}

describe('PopoverService', () => {
  let service: PopoverService;
  let fixture: ComponentFixture<HostComponent>;
  let dialogOpened: Subject<void>;

  const popovers = () => document.querySelectorAll('mifosx-popover');
  const spotlight = () => document.querySelector<HTMLElement>('.spotlight');
  const open = (backdrop = true): PopoverRef =>
    service.open(fixture.componentInstance.content, fixture.componentInstance.target.nativeElement, 'bottom', backdrop);
  /** Lets the spotlight's signals reach the DOM after timers have fired. */
  const advance = (ms: number) => {
    jest.advanceTimersByTime(ms);
    TestBed.tick();
  };

  beforeEach(() => {
    jest.useFakeTimers();
    dialogOpened = new Subject<void>();
    TestBed.configureTestingModule({
      imports: [
        HostComponent,
        TranslateModule.forRoot()
      ],
      providers: [{ provide: MatDialog, useValue: { afterOpened: dialogOpened } }]
    });
    service = TestBed.inject(PopoverService);
    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    document.querySelector('.cdk-overlay-container')?.remove();
  });

  describe('closing a popover', () => {
    it('keeps the popover on screen until its leave animation has played', () => {
      const popover = open();
      TestBed.tick();

      popover.close();

      expect(popovers()).toHaveLength(1);
      expect(popovers()[0].closest('.popover-leaving')).not.toBeNull();

      advance(120);

      expect(popovers()).toHaveLength(0);
    });

    it('notifies afterClosed straight away, and only once', () => {
      const popover = open();
      const closed = jest.fn();
      popover.afterClosed().subscribe(closed);

      popover.close('result');
      popover.close('again');

      expect(closed).toHaveBeenCalledTimes(1);
      expect(closed).toHaveBeenCalledWith('result');
    });

    it('stops the popover from taking input while it animates out', () => {
      const popover = open();
      TestBed.tick();

      popover.close();

      expect(popovers()[0].closest<HTMLElement>('.cdk-overlay-pane').inert).toBe(true);
    });
  });

  describe('spotlight', () => {
    it('stays up between two tour steps and moves to the new target', () => {
      const secondTarget = document.createElement('div');
      jest
        .spyOn(secondTarget, 'getBoundingClientRect')
        .mockReturnValue({ top: 100, left: 200, width: 50, height: 20 } as DOMRect);

      const firstStep = open();
      TestBed.tick();
      const element = spotlight();

      firstStep.close();
      advance(200);
      service.open(fixture.componentInstance.content, secondTarget, 'bottom', true);
      advance(1000);

      expect(spotlight()).toBe(element);
      expect(element.classList).not.toContain('leaving');
      expect(element.style.top).toBe('92px');
      expect(element.style.left).toBe('192px');
      expect(element.style.width).toBe('66px');
      expect(element.style.height).toBe('36px');
    });

    it('fades out and is removed when no step follows', () => {
      open().close();
      TestBed.tick();

      advance(399);
      expect(spotlight().classList).not.toContain('leaving');

      advance(1);
      expect(spotlight().classList).toContain('leaving');

      advance(240);
      expect(spotlight()).toBeNull();
    });

    it('comes back when a step opens while it is fading out', () => {
      open().close();
      advance(450);
      expect(spotlight().classList).toContain('leaving');

      open();
      advance(1000);

      expect(spotlight().classList).not.toContain('leaving');
    });

    it('hands over to a dialog without waiting for a next step', () => {
      open().close();
      TestBed.tick();

      dialogOpened.next();
      TestBed.tick();

      expect(spotlight().classList).toContain('leaving');
    });

    it('stays up when a dialog opens over an open popover', () => {
      open();
      TestBed.tick();

      dialogOpened.next();
      TestBed.tick();

      expect(spotlight().classList).not.toContain('leaving');
    });

    it('is not shown for a popover without a backdrop', () => {
      open(false);
      TestBed.tick();

      expect(popovers()).toHaveLength(1);
      expect(spotlight()).toBeNull();
    });
  });
});
