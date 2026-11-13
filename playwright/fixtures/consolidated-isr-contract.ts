/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import type { Page } from '@playwright/test';
import {
  isrCapabilities,
  isrEligibility,
  isrSources,
  isrPreview,
  isrCalculation,
  isrId,
  isrReconciliation,
  isrWireJson
} from './consolidated-isr-data';

export const isrPermissions = [
  'READ_CONSOLIDATED_ISR_ELIGIBILITY',
  'READ_CONSOLIDATED_ISR',
  'PREVIEW_CONSOLIDATED_ISR',
  'READ_CONSOLIDATED_ISR_AUDIT',
  'RECONCILE_CONSOLIDATED_ISR'
];

export async function installIsrContracts(
  page: Page,
  permissions = isrPermissions,
  language = { name: 'English', code: 'en' }
) {
  const reads: URL[] = [];
  const writes: string[] = [];
  await page.addInitScript(
    ({ permissions, language }) => {
      if (![
          'http:',
          'https:'
        ].includes(location.protocol)) return;
      const credentials = JSON.stringify({
        authenticated: true,
        userId: 1,
        username: 'synthetic-isr-reader',
        officeId: 1,
        officeName: 'Synthetic office',
        permissions,
        roles: [],
        base64EncodedAuthenticationKey: 'fixture',
        rememberMe: false,
        shouldRenewPassword: false
      });
      sessionStorage.setItem('mifosXCredentials', credentials);
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXLanguage', JSON.stringify(language));
      localStorage.setItem('mifosXDateFormat', JSON.stringify('yyyy-MM-dd'));
    },
    { permissions, language }
  );
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace(/^.*\/api\/v\d+/, '');
    if (request.method() !== 'GET') {
      writes.push(path);
      await route.fulfill({ status: 409, json: { reasonCode: 'REQUEST_CONFLICT' } });
      return;
    }
    reads.push(url);
    const client = Number(path.match(/\/clients\/(\d+)/)?.[1] || 7);
    let data: unknown = [];
    if (path === '/notifications') data = { pageItems: [], totalFilteredRecords: 0 };
    else if (path === '/clients/template') data = {};
    else if (/^\/clients\/\d+$/.test(path))
      data = {
        id: client,
        displayName: `Synthetic customer ${client}`,
        groups: [],
        accountNo: `SYN${client}`,
        officeId: 1,
        officeName: 'Synthetic office',
        status: { id: 300, code: 'clientStatusType.active', value: 'Active' },
        active: true,
        legalForm: { id: 1 },
        timeline: { activatedOnDate: [
            2026,
            1,
            1
          ] }
      };
    else if (path.endsWith('/images')) {
      await route.fulfill({ status: 404, json: {} });
      return;
    } else if (path.includes('/configurations/name/')) data = { enabled: false, value: 0 };
    else if (path === '/savings/consolidated-isr/template') data = isrCapabilities;
    else if (path.endsWith('/eligibility'))
      data = client === 7 ? isrEligibility() : { ...isrEligibility(client), accounts: [] };
    else if (path.endsWith('/accounts')) data = isrSources(client);
    else if (path.endsWith('/preview')) data = isrPreview(client);
    else if (path.endsWith('/calculations'))
      data =
        client === 7 && url.searchParams.get('after') === '0' ? [{ sequence: 41, calculation: isrCalculation() }] : [];
    else if (path.endsWith('/calculations/' + isrId)) data = isrCalculation(client);
    else if (path.endsWith('/audit'))
      data = [
        {
          id: 21,
          action: 'ASSESSMENT_SAVED',
          actorId: 1,
          businessDate: '2026-11-12',
          recordedAt: '2026-11-12T08:00:00Z',
          detailsJson: 'sensitive-fixture-must-not-render'
        }
      ];
    else if (path.endsWith('/reconciliation')) data = isrReconciliation;
    await route.fulfill({ contentType: 'application/json', body: isrWireJson(data) });
  });
  return { reads, writes };
}
