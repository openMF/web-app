/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * ESLint rule: `mifosx-playwright/no-direct-login-goto`
 *
 * Per GSoC 2026 proposal WA-2.3.
 *
 * Forbids `page.goto('/login')` (and variants like `/#/login`) in spec
 * files. Tests MUST consume the pre-authenticated `storageState` set
 * up by `auth.setup.ts`. Direct navigation to /login from a spec is a
 * smell that either:
 *   - the spec is re-doing auth that the setup project already did, or
 *   - the spec is intentionally signing out, in which case it belongs
 *     in a dedicated auth-flow spec under `playwright/tests/auth/`.
 *
 * The rule does NOT fire inside files matching `auth*.setup.ts` or any
 * page object under `playwright/pages/login*` — those are the legal
 * homes for the login route literal.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: "Disallow page.goto('/login') in Playwright specs — use the auth.setup storageState instead.",
      recommended: true
    },
    schema: [],
    messages: {
      forbidden:
        "Do not call page.goto('{{path}}') from a spec. Tests should consume the " +
        'storageState produced by auth.setup.ts. If you must drive the login flow, ' +
        'put the test under playwright/tests/auth/ and use the LoginPage page object.'
    }
  },
  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/');

    // Allow inside setup files, login page object, route registry,
    // and any spec whose subject IS the login flow itself
    // (playwright/tests/auth/** or playwright/tests/login*.spec.ts).
    const isAllowedFile =
      /\.setup\.ts$/.test(filename) ||
      /\/playwright\/pages\/login[^/]*\.ts$/.test(filename) ||
      /\/playwright\/pages\/BasePage\.ts$/.test(filename) ||
      /\/playwright\/config\/routes\.ts$/.test(filename) ||
      /\/playwright\/auth-helpers\.ts$/.test(filename) ||
      /\/playwright\/tests\/auth\//.test(filename) ||
      /\/playwright\/tests\/login[^/]*\.spec\.ts$/.test(filename);

    if (isAllowedFile) {
      return {};
    }

    function isLoginPath(value) {
      if (typeof value !== 'string') return false;
      const normalized = value.toLowerCase();
      return (
        normalized === '/login' ||
        normalized === '/#/login' ||
        normalized.endsWith('/login') ||
        normalized.endsWith('/#/login')
      );
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (!callee || callee.type !== 'MemberExpression') return;
        if (!callee.property || callee.property.name !== 'goto') return;
        const [arg] = node.arguments;
        if (!arg) return;
        // Literal string argument
        if (arg.type === 'Literal' && isLoginPath(arg.value)) {
          context.report({ node: arg, messageId: 'forbidden', data: { path: arg.value } });
          return;
        }
        // Template literal with a single quasi
        if (arg.type === 'TemplateLiteral' && arg.expressions.length === 0) {
          const value = arg.quasis.map((q) => q.value.cooked).join('');
          if (isLoginPath(value)) {
            context.report({ node: arg, messageId: 'forbidden', data: { path: value } });
          }
        }
      }
    };
  }
};
