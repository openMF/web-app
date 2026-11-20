/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { AuthMode } from './oauth.config';

/**
 * The runtime settings in `assets/env.js` are read once, when the environment module loads.
 * Docker images generate that file from `env.template.js` with `envsubst`, so every flag
 * arrives as a quoted string (e.g. `'true'`) rather than a boolean.
 */
function resolveAuthMode(runtimeEnv: Record<string, unknown>): AuthMode {
  const previousEnv = (window as any).env;
  (window as any).env = runtimeEnv;
  try {
    let authMode: AuthMode;
    jest.isolateModules(() => {
      authMode = require('./oauth.config').getActiveAuthMode();
    });
    return authMode;
  } finally {
    (window as any).env = previousEnv;
  }
}

describe('getActiveAuthMode', () => {
  it('enables OAuth2 when the Docker template sets MIFOS_OAUTH_SERVER_ENABLED=true', () => {
    expect(resolveAuthMode({ oauthServerEnabled: 'true', oidcServerEnabled: '' })).toBe(AuthMode.OAuth2);
  });

  it('enables OAuth2 when env.js sets the flag as a boolean', () => {
    expect(resolveAuthMode({ oauthServerEnabled: true })).toBe(AuthMode.OAuth2);
  });

  it('keeps Basic authentication when the OAuth flag is disabled', () => {
    expect(resolveAuthMode({ oauthServerEnabled: 'false', oidcServerEnabled: 'false' })).toBe(AuthMode.Basic);
    expect(resolveAuthMode({ oauthServerEnabled: false })).toBe(AuthMode.Basic);
    expect(resolveAuthMode({ oauthServerEnabled: '' })).toBe(AuthMode.Basic);
  });

  it('gives OIDC precedence over OAuth2 when both are enabled', () => {
    expect(resolveAuthMode({ oauthServerEnabled: 'true', oidcServerEnabled: 'true' })).toBe(AuthMode.OIDC);
  });
});
