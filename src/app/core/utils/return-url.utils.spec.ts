/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { DefaultUrlSerializer } from '@angular/router';

import { DEFAULT_RETURN_URL, sanitizeReturnUrl } from './return-url.utils';

describe('sanitizeReturnUrl', () => {
  it('should keep in-app router URLs', () => {
    expect(sanitizeReturnUrl('/clients')).toBe('/clients');
    expect(sanitizeReturnUrl('/clients/1/general')).toBe('/clients/1/general');
    expect(sanitizeReturnUrl('/clients?officeId=1')).toBe('/clients?officeId=1');
    expect(sanitizeReturnUrl('/loginless-report')).toBe('/loginless-report');
  });

  it('should fall back to the dashboard when nothing was preserved', () => {
    expect(sanitizeReturnUrl(null)).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl(undefined)).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('')).toBe(DEFAULT_RETURN_URL);
  });

  it('should reject destinations that leave the application origin', () => {
    expect(sanitizeReturnUrl('//evil.example.com')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('https://evil.example.com')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('/\\evil.example.com')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('javascript:alert(1)')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('clients')).toBe(DEFAULT_RETURN_URL);
  });

  it('should refuse the login page so authentication cannot loop', () => {
    expect(sanitizeReturnUrl('/login')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('/login?returnUrl=%2Fclients')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('/login/reset-password')).toBe(DEFAULT_RETURN_URL);
  });

  it('should refuse login routes disguised by encoding or matrix parameters', () => {
    // The router decodes segments, so these all resolve to the login page.
    expect(sanitizeReturnUrl('/lo%67in')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('/%6C%6F%67%69%6E')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('/login;next=/clients')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('/login;a=b?returnUrl=%2Fclients')).toBe(DEFAULT_RETURN_URL);
  });

  it('should reject values the router cannot parse', () => {
    // `navigateByUrl` would throw NG04010 on these.
    expect(sanitizeReturnUrl('/(a')).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl('/a(b')).toBe(DEFAULT_RETURN_URL);
  });

  it('should reject non-string values produced by duplicated query parameters', () => {
    // `?returnUrl=/a&returnUrl=/b` makes the router yield an array, which has no startsWith.
    const duplicated = new DefaultUrlSerializer().parse('/login?returnUrl=%2Fa&returnUrl=%2Fb').queryParams[
      'returnUrl'
    ];
    expect(Array.isArray(duplicated)).toBe(true);
    expect(sanitizeReturnUrl(duplicated)).toBe(DEFAULT_RETURN_URL);

    expect(sanitizeReturnUrl(42)).toBe(DEFAULT_RETURN_URL);
    expect(sanitizeReturnUrl({ toString: () => '/clients' })).toBe(DEFAULT_RETURN_URL);
  });
});
