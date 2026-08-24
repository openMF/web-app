/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

import { CopilotExportService, Exchange } from './copilot-export.service';
import { ChatMessage } from '../core/models/chat-message.model';

const addImage = jest.fn();
const addPage = jest.fn();
const save = jest.fn();

jest.mock('jspdf', () => ({
  jsPDF: jest.fn().mockImplementation(() => ({ addImage, addPage, save }))
}));

/** A canvas of a given height, standing in for the photographed page. */
let renderedHeight = 400;
let renderedNode: HTMLElement | null = null;

jest.mock('html2canvas', () => ({
  __esModule: true,
  default: jest.fn((node: HTMLElement) => {
    renderedNode = node;
    return Promise.resolve({
      width: 1560,
      height: renderedHeight,
      toDataURL: () => 'data:image/png;base64,x'
    });
  })
}));

function exchange(overrides: Partial<Exchange> = {}): Exchange {
  const reply: ChatMessage = {
    id: 'm-2',
    role: 'assistant',
    content: '**Aisha Bello** has one active loan',
    timestamp: Date.UTC(2026, 2, 14, 9, 30)
  };
  const question: ChatMessage = {
    id: 'm-1',
    role: 'user',
    content: 'how many loans does aisha have?',
    timestamp: Date.UTC(2026, 2, 14, 9, 29),
    contextUrl: '/clients/42/general'
  };
  return { question, reply, askedBy: 'priya', clientName: 'Aisha Bello', ...overrides };
}

describe('CopilotExportService', () => {
  let service: CopilotExportService;

  beforeEach(() => {
    renderedHeight = 400;
    renderedNode = null;
    // A canvas 2D context so slicing has something to draw into; jsdom supplies none.
    HTMLCanvasElement.prototype.getContext = jest.fn(() => ({ drawImage: jest.fn() })) as never;
    HTMLCanvasElement.prototype.toDataURL = jest.fn(() => 'data:image/png;base64,slice') as never;

    TestBed.configureTestingModule({
      providers: [
        CopilotExportService,
        { provide: TranslateService, useValue: { instant: (key: string) => key } }
      ]
    });
    service = TestBed.inject(CopilotExportService);
    window.history.replaceState({}, '', '/web-app/');
  });

  afterEach(() => {
    delete (navigator as { share?: unknown }).share;
  });

  describe('exportToPdf', () => {
    it('files the exchange and leaves nothing behind in the document', async () => {
      const before = document.body.children.length;

      await service.exportToPdf(exchange());

      expect(save).toHaveBeenCalledWith('aisha-bello-2026-03-14.pdf');
      expect(document.body.children.length).toBe(before);
    });

    /** A half-rendered page stuck off-screen would leak on every failed export. */
    it('removes the off-screen page even when rendering fails', async () => {
      const before = document.body.children.length;
      HTMLCanvasElement.prototype.toDataURL = jest.fn(() => {
        throw new Error('canvas tainted');
      }) as never;

      await expect(service.exportToPdf(exchange())).rejects.toThrow('canvas tainted');
      expect(document.body.children.length).toBe(before);
    });

    it('puts the question, the client and the answer on the page', async () => {
      await service.exportToPdf(exchange());

      expect(renderedNode?.innerHTML).toContain('how many loans does aisha have?');
      expect(renderedNode?.innerHTML).toContain('Aisha Bello');
      // The reply is rendered as markdown, so the emphasis the officer read survives.
      expect(renderedNode?.innerHTML).toContain('<strong>Aisha Bello</strong>');
    });

    /** The question is text somebody typed. Rendering it as markup would be an injection. */
    it('escapes the question rather than rendering it', async () => {
      const typed = { ...exchange().question!, content: '<img src=x onerror=alert(1)>' };

      await service.exportToPdf(exchange({ question: typed }));

      expect(renderedNode?.innerHTML).not.toContain('<img src=x');
      expect(renderedNode?.innerHTML).toContain('&lt;img src=x');
    });

    it('splits a reply too tall for one page across pages', async () => {
      // 1560px across 180mm is 8.67px/mm, so a page holds about 2314px.
      renderedHeight = 5000;

      await service.exportToPdf(exchange());

      expect(addImage).toHaveBeenCalledTimes(3);
      expect(addPage).toHaveBeenCalledTimes(2); // The first page is not added, it is there.
    });

    it('keeps a short reply on a single page', async () => {
      await service.exportToPdf(exchange());

      expect(addImage).toHaveBeenCalledTimes(1);
      expect(addPage).not.toHaveBeenCalled();
    });
  });

  describe('share', () => {
    it('offers the answer and a link back to the record through the share sheet', async () => {
      const share = jest.fn(() => Promise.resolve());
      (navigator as { share?: unknown }).share = share;

      const outcome = await service.share(exchange());

      expect(outcome).toBe('shared');
      expect(share).toHaveBeenCalledWith(
        expect.objectContaining({
          text: expect.stringContaining('Aisha Bello has one active loan'),
          url: 'http://localhost/web-app/#/clients/42/general'
        })
      );
    });

    /** Nothing on screen changes on a clipboard write, so the caller has to be told. */
    it('falls back to the clipboard where there is no share sheet', async () => {
      const writeText = jest.fn(() => Promise.resolve());
      Object.assign(navigator, { clipboard: { writeText } });

      const outcome = await service.share(exchange());

      expect(outcome).toBe('copied');
      expect(writeText).toHaveBeenCalledWith(expect.stringContaining('#/clients/42/general'));
    });

    it('treats a dismissed share sheet as a decision, not a reason to copy', async () => {
      const writeText = jest.fn(() => Promise.resolve());
      Object.assign(navigator, { clipboard: { writeText } });
      (navigator as { share?: unknown }).share = jest.fn(() =>
        Promise.reject(Object.assign(new Error('cancelled'), { name: 'AbortError' }))
      );

      const outcome = await service.share(exchange());

      expect(outcome).toBe('failed');
      expect(writeText).not.toHaveBeenCalled();
    });

    it('shares the answer alone when nothing says which record it came from', async () => {
      const writeText = jest.fn(() => Promise.resolve());
      Object.assign(navigator, { clipboard: { writeText } });
      const anonymous = exchange();
      delete anonymous.question!.contextUrl;

      await service.share(anonymous);

      expect(writeText).toHaveBeenCalledWith(expect.not.stringContaining('http://'));
    });

    it('reports a clipboard that refused rather than claiming to have shared', async () => {
      Object.assign(navigator, { clipboard: { writeText: jest.fn(() => Promise.reject(new Error('denied'))) } });

      expect(await service.share(exchange())).toBe('failed');
    });
  });
});
