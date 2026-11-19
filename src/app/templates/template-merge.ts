/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/**
 * Fineract's template merge (`POST /templates/{id}`), done in the browser. On the server every mapper URL must match
 * `fineract.template.regex-whitelist`, which is on and empty by default, so each cooperative's server would need its
 * own setting before any template printed. Here the mappers are fetched with the user's own session instead, and the
 * same Mustache text gives the same output, so templates stay compatible with the server merge.
 *
 * ponytail: the Mustache subset Fineract templates use (values, `{{{raw}}}`, `{{#section}}`, `{{^inverted}}`,
 * `{{! comment}}`); no partials or custom delimiters, add them if a template needs them.
 */

/** Fineract also offers every array as `key#0`, `key#1`, … (TemplateMergeServiceImpl.expandMapArrays). */
export function expandArrays<T>(value: T): T {
  if (Array.isArray(value)) {
    value.forEach(expandArrays);
  } else if (value && typeof value === 'object') {
    for (const [
      key,
      item
    ] of Object.entries(value)) {
      expandArrays(item);
      if (Array.isArray(item)) {
        item.forEach((element, i) => ((value as any)[`${key}#${i}`] = element));
      }
    }
  }
  return value;
}

/**
 * The API path a mapper's URL points at, relative to the app's API prefix: `v1/loans/{{loanId}}?…` or a full
 * `https://host/fineract-provider/api/v1/loans/…` both become `/v1/loans/7?…`.
 */
export function mapperPath(mapperValue: string, scope: object): string {
  let url = renderTemplate(mapperValue, scope, false).trim();
  const api = url.indexOf('/api/');
  if (/^https?:/i.test(url) && api >= 0) {
    url = url.slice(api + '/api'.length);
  }
  return '/' + url.replace(/^\/+/, '');
}

export function renderTemplate(text: string, scope: object, escape = true): string {
  return render(text ?? '', [scope], escape);
}

const TAG = /\{\{(\{)?\s*([#^/!&])?\s*([^}]*?)\s*\}\}(\})?/g;

function render(text: string, stack: any[], escape: boolean): string {
  let out = '';
  let pos = 0;
  const tag = new RegExp(TAG.source, 'g');
  let match: RegExpExecArray | null;
  while ((match = tag.exec(text))) {
    const [
      whole,
      triple,
      kind,
      name
    ] = match;
    out += text.slice(pos, match.index);
    pos = match.index + whole.length;
    if (kind === '!' || kind === '/') {
      continue;
    }
    if (kind === '#' || kind === '^') {
      const close = closingTag(text, name, pos);
      const inner = text.slice(pos, close.start);
      pos = tag.lastIndex = close.end;
      const value = lookup(name, stack);
      const empty = !value || (Array.isArray(value) && value.length === 0);
      if (kind === '^') {
        out += empty ? render(inner, stack, escape) : '';
      } else if (empty) {
        continue;
      } else if (Array.isArray(value)) {
        out += value
          .map((item) =>
            render(
              inner,
              [
                ...stack,
                item
              ],
              escape
            )
          )
          .join('');
      } else {
        out += render(
          inner,
          typeof value === 'object' ? [
                ...stack,
                value
              ] : stack,
          escape
        );
      }
      continue;
    }
    const value = lookup(name, stack);
    const shown = value === undefined || value === null || typeof value === 'object' ? '' : String(value);
    out += escape && !triple && kind !== '&' ? escapeHtml(shown) : shown;
  }
  return out + text.slice(pos);
}

/** The `{{/name}}` that closes a section opened just before `from`, skipping nested sections of the same name. */
function closingTag(text: string, name: string, from: number): { start: number; end: number } {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tag = new RegExp(`\\{\\{\\s*([#^/])\\s*${escaped}\\s*\\}\\}`, 'g');
  tag.lastIndex = from;
  let depth = 1;
  let match: RegExpExecArray | null;
  while ((match = tag.exec(text))) {
    depth += match[1] === '/' ? -1 : 1;
    if (depth === 0) {
      return { start: match.index, end: match.index + match[0].length };
    }
  }
  // Not closed: the section runs to the end, as Mustache would refuse the template anyway.
  return { start: text.length, end: text.length };
}

/**
 * A dotted name, looked up from the innermost section out; `.` is the current item. A part can pick one item of a
 * list by a field's value, `family[relationship=Grandfather]` (case ignored), which plain Mustache cannot.
 */
function lookup(name: string, stack: any[]): any {
  if (name === '.') {
    return stack[stack.length - 1];
  }
  const [
    first,
    ...rest
  ] = name.split('.').map(parsePart);
  for (let i = stack.length - 1; i >= 0; i--) {
    const context = stack[i];
    if (context && typeof context === 'object' && first.key in context) {
      return rest.reduce((value, part) => step(value, part), pick(context[first.key], first));
    }
  }
  return undefined;
}

interface Part {
  key: string;
  field?: string;
  equals?: string;
}

function parsePart(part: string): Part {
  const match = /^(.+)\[([^=\]]+)=([^\]]*)\]$/.exec(part);
  return match ? { key: match[1], field: match[2].trim(), equals: match[3].trim().toLowerCase() } : { key: part };
}

function step(value: any, part: Part): any {
  return value == null ? undefined : pick(value[part.key], part);
}

function pick(value: any, part: Part): any {
  if (!part.field) {
    return value;
  }
  return Array.isArray(value)
    ? value.find((item) => String(item?.[part.field] ?? '').toLowerCase() === part.equals)
    : undefined;
}

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
}

/**
 * The `<head>` of a printed template: A4 with no browser margin, which also drops the browser's own header and footer
 * (the page address and date), and the margin put back as padding; a size that keeps an annex on one page.
 */
export const PRINT_HEAD =
  '<meta charset="utf-8"><style>@page { size: A4; margin: 0; } ' +
  'body { margin: 0; padding: 12mm 14mm; font-size: 13px; line-height: 1.35; } p { margin: 6px 0; }</style>';
