/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { IdempotencyKeyFactory } from './idempotency';

describe('IdempotencyKeyFactory', () => {
  let factory: IdempotencyKeyFactory;

  beforeEach(() => {
    factory = new IdempotencyKeyFactory();
  });

  it('builds the documented key shape', () => {
    expect(factory.generate(42, 'approve_and_disburse_loan', 107, 1719360000000)).toBe(
      'usr-42-approve_and_disburse_loan-107-1719360000000'
    );
  });

  it('is deterministic for identical inputs (so retries dedupe)', () => {
    const a = factory.generate(7, 'record_repayment', 3892, 1719360000000);
    const b = factory.generate(7, 'record_repayment', 3892, 1719360000000);
    expect(a).toBe(b);
  });

  it('differs when any input differs', () => {
    const base = factory.generate(7, 'record_repayment', 3892, 1000);
    expect(base).not.toBe(factory.generate(8, 'record_repayment', 3892, 1000));
    expect(base).not.toBe(factory.generate(7, 'create_loan', 3892, 1000));
    expect(base).not.toBe(factory.generate(7, 'record_repayment', 9999, 1000));
    expect(base).not.toBe(factory.generate(7, 'record_repayment', 3892, 2000));
  });

  it('slugs tool names with spaces or punctuation', () => {
    expect(factory.generate(1, 'Approve & Disburse Loan', 5, 10)).toBe('usr-1-approve_disburse_loan-5-10');
  });
});
