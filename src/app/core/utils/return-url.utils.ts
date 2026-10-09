/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { DefaultUrlSerializer, PRIMARY_OUTLET } from '@angular/router';

/** Destination used whenever no safe return URL was preserved. */
export const DEFAULT_RETURN_URL = '/';

/** Stateless parser used to resolve a candidate URL the way the router would. */
const urlSerializer = new DefaultUrlSerializer();

/**
 * Validates a preserved `returnUrl` before it is handed to `Router.navigateByUrl`.
 *
 * The value reaches the application through the query string, so it is attacker
 * controlled: only in-app router URLs are allowed through, and the login page itself is
 * refused so a preserved destination can never send the user back into the login flow.
 *
 * @param {unknown} returnUrl Candidate destination, typically the `returnUrl` query parameter.
 *   Typed loosely because a duplicated query parameter makes the router yield a `string[]`.
 * @returns {string} The destination when it is a safe in-app route, otherwise {@link DEFAULT_RETURN_URL}.
 */
export function sanitizeReturnUrl(returnUrl: unknown): string {
  if (typeof returnUrl !== 'string' || !returnUrl) {
    return DEFAULT_RETURN_URL;
  }

  // Router URLs are absolute paths. `//host` is protocol relative and browsers normalise
  // backslashes to slashes, so either shape would escape the application origin.
  if (!returnUrl.startsWith('/') || returnUrl.startsWith('//') || returnUrl.includes('\\')) {
    return DEFAULT_RETURN_URL;
  }

  // Compare against the route the URL actually resolves to rather than its raw text: the
  // serializer decodes percent-escapes and separates matrix parameters, so `/lo%67in` and
  // `/login;foo=bar` are both recognised as the login page.
  let segments;
  try {
    segments = urlSerializer.parse(returnUrl).root.children[PRIMARY_OUTLET]?.segments;
  } catch {
    // Unparseable as a router URL; `navigateByUrl` would throw on it too.
    return DEFAULT_RETURN_URL;
  }

  return segments?.[0]?.path === 'login' ? DEFAULT_RETURN_URL : returnUrl;
}
