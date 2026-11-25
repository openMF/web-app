/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TruncateTextPipe } from './truncate-text.pipe';

describe('TruncateTextPipe', () => {
  let pipe: TruncateTextPipe;

  beforeEach(() => {
    pipe = new TruncateTextPipe();
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  describe('Null and empty values', () => {
    it('should return empty string when value is null', () => {
      expect(pipe.transform(null as any)).toBe('');
    });

    it('should return empty string when value is undefined', () => {
      expect(pipe.transform(undefined as any)).toBe('');
    });

    it('should return empty string when value is empty string', () => {
      expect(pipe.transform('')).toBe('');
    });
  });

  describe('Default truncation (30 characters)', () => {
    it('should return original text when length is less than 30', () => {
      const text = 'Short text';
      expect(pipe.transform(text)).toBe(text);
    });

    it('should return original text when length is exactly 30', () => {
      const text = '123456789012345678901234567890';
      expect(pipe.transform(text)).toBe(text);
    });

    it('should truncate to 30 characters when length exceeds 30', () => {
      const text = '123456789012345678901234567890EXTRA';
      expect(pipe.transform(text)).toBe('123456789012345678901234567890');
    });
  });

  describe('Custom chars parameter', () => {
    it('should return original text when length is less than custom chars', () => {
      const text = 'Short';
      expect(pipe.transform(text, 10)).toBe('Short');
    });

    it('should return original text when length equals custom chars', () => {
      const text = 'ExactTen10';
      expect(pipe.transform(text, 10)).toBe('ExactTen10');
    });

    it('should truncate text to custom chars when length is under 40 characters', () => {
      const text = 'A string under forty chars';
      expect(pipe.transform(text, 10)).toBe('A string u');
      expect(pipe.transform(text, 15)).toBe('A string under ');
    });

    it('should truncate text to custom chars when length exceeds 40 characters', () => {
      const text = 'This is a much longer string that clearly exceeds the forty character length';
      expect(pipe.transform(text, 20)).toBe('This is a much longe');
    });

    it('should return empty string when chars is 0', () => {
      expect(pipe.transform('Some text', 0)).toBe('');
    });

    it('should fallback to default limit (30) when negative chars is provided', () => {
      const text = '123456789012345678901234567890EXTRA';
      expect(pipe.transform(text, -5)).toBe('123456789012345678901234567890');
    });
  });
});
