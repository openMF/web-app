/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

'use strict';

/**
 * ESLint rule: `mifosx-playwright/no-bare-wait-for-timeout`
 *
 * Per GSoC 2026 proposal WA-2.4.
 *
 * Disallows `page.waitForTimeout(...)` and `.waitForTimeout(...)` on
 * any Playwright object. The only sanctioned way to introduce a hard
 * delay is `loggedSleep(ms, reason)` from `playwright/utils/sleep.ts`,
 * which records the wait in `playwright/sleeps.json` for audit.
 *
 * Allowed files:
 *  - `playwright/utils/sleep.ts` itself
 *  - any file in `playwright/utils/` (so retry/backoff infrastructure
 *    can still use raw timers if it ever needs to)
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow bare page.waitForTimeout in Playwright code — use loggedSleep(ms, reason).',
      recommended: true
    },
    schema: [],
    messages: {
      forbidden:
        'Bare waitForTimeout is banned. Use loggedSleep(ms, reason) from ' +
        'playwright/utils/sleep.ts so the wait is recorded in sleeps.json ' +
        'and reviewable. If you can wait for a DOM signal instead, do that.'
    }
  },
  create(context) {
    const filename = context.getFilename().replace(/\\/g, '/');
    if (/\/playwright\/utils\//.test(filename)) {
      return {};
    }

    return {
      CallExpression(node) {
        const callee = node.callee;
        if (!callee || callee.type !== 'MemberExpression') return;
        if (!callee.property || callee.property.name !== 'waitForTimeout') return;
        context.report({ node, messageId: 'forbidden' });
      }
    };
  }
};
