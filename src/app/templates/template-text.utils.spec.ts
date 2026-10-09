/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { htmlToPlainText, isHtmlText, plainTextToHtml } from './template-text.utils';

describe('template text utils', () => {
  describe('isHtmlText', () => {
    it('detects markup', () => {
      expect(isHtmlText('<p>Hello</p>')).toBe(true);
      expect(isHtmlText('Hello <br/> world')).toBe(true);
    });

    it('treats text without tags as plain, including mustache parameters and comparisons', () => {
      expect(isHtmlText('Dear {{client.displayName}}, balance < 5')).toBe(false);
      expect(isHtmlText('')).toBe(false);
      expect(isHtmlText(null)).toBe(false);
    });
  });

  describe('htmlToPlainText', () => {
    it('separates paragraphs with a blank line, keeps line breaks and decodes entities', () => {
      expect(htmlToPlainText('<p>Hello <b>{{name}}</b></p>\n<p>You &amp; yours<br>bye</p>')).toBe(
        'Hello {{name}}\n\nYou & yours\nbye'
      );
    });

    it('ends other block elements with a single new line', () => {
      expect(htmlToPlainText('<div>one</div><div>two</div><h2>three</h2>')).toBe('one\ntwo\nthree');
    });

    it('keeps meaningful spaces between inline elements', () => {
      expect(htmlToPlainText('<p><b>Hello</b> <i>World</i></p>')).toBe('Hello World');
    });

    it('collapses empty paragraphs and non breaking spaces', () => {
      expect(htmlToPlainText('<p>One</p><p>&nbsp;</p><p>Two</p>')).toBe('One\n\nTwo');
    });

    it('flattens nested blocks such as lists and ignores markup formatting, styles and scripts', () => {
      expect(
        htmlToPlainText(
          '<ul><li>one</li><li>two</li></ul>\n  <div>three</div><style>p { color: red; }</style><script>x()</script>'
        )
      ).toBe('one\ntwo\nthree');
    });

    it('keeps whitespace authored at the start and end of a block', () => {
      expect(htmlToPlainText('<p><br>Hello<br></p>')).toBe('\nHello\n');
      expect(htmlToPlainText('<p>  indented </p>')).toBe('  indented ');
    });

    it('returns an empty string for empty input', () => {
      expect(htmlToPlainText('')).toBe('');
      expect(htmlToPlainText(undefined)).toBe('');
    });
  });

  describe('round trip', () => {
    it('returns the original plain text after converting to HTML and back', () => {
      const text = 'first paragraph\nsecond line\n\nsecond paragraph & more\n\nthird';

      expect(htmlToPlainText(plainTextToHtml(text))).toBe(text);
    });

    it('keeps leading and trailing new lines and spaces', () => {
      for (const text of [
        '\nHello\n',
        'Hello ',
        '  indented',
        ' a \n\n b \n'
      ]) {
        expect(htmlToPlainText(plainTextToHtml(text))).toBe(text);
      }
    });
  });

  describe('plainTextToHtml', () => {
    it('escapes special characters and maps new lines to line breaks and paragraphs', () => {
      expect(plainTextToHtml('Hi {{name}}\nyou & yours\n\nBalance < 5')).toBe(
        '<p>Hi {{name}}<br>you &amp; yours</p><p>Balance &lt; 5</p>'
      );
    });

    it('leaves hand written markup untouched', () => {
      expect(plainTextToHtml('<p>Hi <b>there</b></p>')).toBe('<p>Hi <b>there</b></p>');
    });

    it('returns an empty string for empty input', () => {
      expect(plainTextToHtml('')).toBe('');
      expect(plainTextToHtml(null)).toBe('');
    });
  });
});
