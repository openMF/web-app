/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Formats a template text can be authored in. */
export type TemplateTextFormat = 'plain' | 'html';

/** Matches an opening or closing HTML tag. */
const HTML_TAG_PATTERN = /<\/?[a-z][^>]*>/i;

/** Elements that start on their own line in plain text. */
const BLOCK_TAGS = new Set([
  'P',
  'DIV',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'LI',
  'UL',
  'OL',
  'TABLE',
  'THEAD',
  'TBODY',
  'TFOOT',
  'TR',
  'TD',
  'TH',
  'BLOCKQUOTE',
  'PRE',
  'SECTION',
  'ARTICLE',
  'HEADER',
  'FOOTER'
]);

/** Elements whose content never belongs to the readable text. */
const SKIPPED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'TEMPLATE',
  'NOSCRIPT'
]);

/** A piece of plain text produced from one block of HTML. */
interface TextChunk {
  text: string;
  /** Paragraphs are separated from their neighbours by a blank line, other blocks by a single new line. */
  paragraph: boolean;
}

/**
 * Tells whether a template text contains HTML markup.
 * @param {string} text Template text.
 * @returns {boolean} True when at least one HTML tag is present.
 */
export function isHtmlText(text: string | null | undefined): boolean {
  return !!text && HTML_TAG_PATTERN.test(text);
}

/**
 * Converts HTML markup to plain text.
 * Paragraphs become blank-line separated blocks, other block elements and <br> become new lines, tags are removed
 * and entities are decoded. Whitespace authored inside a block, including at its start and end, is kept, while
 * whitespace that only formats the markup between blocks is ignored. This mirrors plainTextToHtml, so switching
 * formats round-trips the text.
 * @param {string} html HTML markup.
 * @returns {string} Plain text.
 */
export function htmlToPlainText(html: string | null | undefined): string {
  if (!html) {
    return '';
  }
  // DOMParser produces an inert document: no scripts run and no resources load.
  const body = new DOMParser().parseFromString(html, 'text/html').body;
  const chunks = blockChunks(body);
  let text = '';
  chunks.forEach((chunk, index) => {
    if (index > 0) {
      text += chunk.paragraph || chunks[index - 1].paragraph ? '\n\n' : '\n';
    }
    text += chunk.text;
  });
  return text.replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n');
}

/**
 * Converts plain text to HTML markup.
 * Text that already contains markup is returned untouched so hand written HTML renders as authored.
 * Otherwise special characters are escaped, blank lines separate paragraphs and single new lines become line breaks.
 * @param {string} text Plain text.
 * @returns {string} HTML markup.
 */
export function plainTextToHtml(text: string | null | undefined): string {
  if (!text) {
    return '';
  }
  if (isHtmlText(text)) {
    return text;
  }
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\r\n?/g, '\n');
  return escaped
    .split(/\n[ \t]*\n+/)
    .map((paragraph) => `<p>${paragraph.split('\n').join('<br>')}</p>`)
    .join('');
}

/**
 * Splits a block container into text chunks: every block element (nested containers are flattened) and every run
 * of inline content between blocks becomes one chunk. Whitespace-only runs between blocks are markup formatting
 * and are dropped; whitespace-only blocks (such as TinyMCE's empty paragraphs) become empty chunks.
 * @param {Element} container Block container.
 * @returns {TextChunk[]} Text chunks in document order.
 */
function blockChunks(container: Element): TextChunk[] {
  const chunks: TextChunk[] = [];
  let inlineRun = '';
  const flushInlineRun = () => {
    if (inlineRun.trim() !== '') {
      chunks.push({ text: inlineRun, paragraph: false });
    }
    inlineRun = '';
  };
  Array.from(container.childNodes).forEach((child) => {
    if (isBlockElement(child)) {
      flushInlineRun();
      if (Array.from(child.childNodes).some(isBlockElement)) {
        chunks.push(...blockChunks(child));
      } else {
        const text = inlineText(child);
        chunks.push({ text: text.trim() === '' ? '' : text, paragraph: child.tagName === 'P' });
      }
    } else {
      inlineRun += inlineText(child);
    }
  });
  flushInlineRun();
  return chunks;
}

/**
 * Text of a node without block level descendants: text is kept as authored, <br> becomes a new line,
 * non breaking spaces become spaces and scripts or styles are dropped.
 * @param {Node} node DOM node.
 * @returns {string} Plain text.
 */
function inlineText(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return (node.textContent ?? '').replace(/\u00a0/g, ' ');
  }
  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }
  const element = node as Element;
  if (element.tagName === 'BR') {
    return '\n';
  }
  if (SKIPPED_TAGS.has(element.tagName)) {
    return '';
  }
  return Array.from(element.childNodes).map(inlineText).join('');
}

/**
 * Tells whether a node is a block level element.
 * @param {Node} node DOM node.
 */
function isBlockElement(node: Node): node is Element {
  return node.nodeType === Node.ELEMENT_NODE && BLOCK_TAGS.has((node as Element).tagName);
}
