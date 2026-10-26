/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { toPlainText } from './plain-text';

/**
 * What lands when a reply is copied out of the panel.
 *
 * <p>The destination is a case note, an email, or a PDF an officer files. Every one of them
 * shows the text exactly as given, so anything markdown left behind is something a person has
 * to delete by hand.
 */
describe('toPlainText', () => {
  it('unwraps the emphasis the panel renders', () => {
    expect(toPlainText('**Aisha Bello** has *one* active `loan`')).toBe('Aisha Bello has one active loan');
  });

  it('keeps bullets readable and drops heading hashes', () => {
    expect(toPlainText('## Summary\n- first\n- second')).toBe('Summary\n- first\n- second');
  });

  it('turns a table into columns that still line up', () => {
    const table = [
      '| Due | Amount |',
      '| --- | --- |',
      '| 1 Mar | 1,200.00 |',
      '| 1 Apr | 950.00 |'
    ].join('\n');

    expect(toPlainText(table)).toBe(
      [
        'Due    Amount',
        '1 Mar  1,200.00',
        '1 Apr  950.00'
      ].join('\n')
    );
  });

  /** Stripping markdown out of a payload would change what it says. */
  it('leaves a fenced block exactly as it was written', () => {
    const fenced = '```json\n{\n  "principal": "**not bold**"\n}\n```';

    expect(toPlainText(fenced)).toBe('{\n  "principal": "**not bold**"\n}');
  });

  it('has nothing to say about nothing', () => {
    expect(toPlainText(null)).toBe('');
    expect(toPlainText(undefined)).toBe('');
  });
});
