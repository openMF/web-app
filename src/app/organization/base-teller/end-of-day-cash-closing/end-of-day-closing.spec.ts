import { closingError } from './end-of-day-closing-error';
import { canReadClosing } from './end-of-day-closing.guard';
import { fromUnits, toUnits } from '../cash-exchange/cash-exchange.models';
import { parseExchangeResponse } from '../cash-exchange/cash-exchange.service';

// Pure policy and decimal tests use no HTTP stubs or mocked services.
describe('End of day closing boundaries', () => {
  it.each([
    'ALL_FUNCTIONS',
    'ALL_FUNCTIONS_READ',
    'READ_BASE_TELLER_END_OF_DAY_CLOSING'
  ])('allows the backend read permission %s', (permission) => expect(canReadClosing([permission])).toBe(true));
  it.each([
    [],
    ['READ_TELLER'],
    ['CREATE_BASE_TELLER_END_OF_DAY_CLOSING'],
    ['REPRINT_BASE_TELLER_END_OF_DAY_CLOSING']
  ])('does not infer read access from other permissions %j', (...permissions) =>
    expect(canReadClosing(permissions as string[])).toBe(false)
  );
  it.each([
    [
      'authorization.invalid',
      'eod.invalidAuthorization'
    ],
    [
      'authorization.required',
      'eod.invalidAuthorization'
    ],
    [
      'already.closed',
      'eod.alreadyClosed'
    ],
    [
      'check.unavailable',
      'eod.checkChanged'
    ],
    [
      'denomination.invalid',
      'eod.invalidDeclaration'
    ],
    [
      'quantity.invalid',
      'eod.invalidDeclaration'
    ],
    [
      'amount.invalid',
      'eod.invalidDeclaration'
    ],
    [
      'idempotency.conflict',
      'eod.conflict'
    ],
    [
      'date.invalid',
      'eod.conflict'
    ],
    [
      'custody.inconsistent',
      'eod.conflict'
    ]
  ])('maps %s without exposing server text', (code, key) => {
    expect(
      closingError({
        status: 403,
        error: { errors: [{ userMessageGlobalisationCode: code, developerMessage: 'private server details' }] }
      })
    ).toBe(key);
    expect(
      closingError({ status: 403, error: JSON.stringify({ errors: [{ userMessageGlobalisationCode: code }] }) })
    ).toBe(key);
  });
  it.each([
    [
      0,
      'eod.network'
    ],
    [
      401,
      'errors.error.auth.sessionExpired.message'
    ],
    [
      403,
      'eod.forbidden'
    ],
    [
      409,
      'eod.conflict'
    ],
    [
      500,
      'eod.failed'
    ]
  ])('handles HTTP %s using safe text', (status, key) =>
    expect(closingError({ status: status as number, error: 'SQL stack trace' })).toBe(key)
  );
  it('preserves decimal tokens beyond binary floating point precision', () => {
    const result = parseExchangeResponse<{ amount: string }>('{"amount":9007199254740991.01}');
    expect(fromUnits(toUnits(result.amount, 2), 2)).toBe('9007199254740991.01');
  });
  it('rejects vouchers exceeding a currency precision', () => expect(() => toUnits('0.001', 2)).toThrow());
  it('keeps cash display arithmetic exact for fractional denominations', () =>
    expect(fromUnits(toUnits('0.10', 2) * 3n, 2)).toBe('0.30'));
});
