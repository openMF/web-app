/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Page } from '@playwright/test';
import {
  configurationFixture,
  rateFixture,
  rateTemplateFixture,
  rateWriteFixture,
  policyTemplateFixture
} from '../../src/app/products/investment-products/investment-product.fixtures';
import {
  serializeInvestmentJson,
  parseInvestmentJson
} from '../../src/app/products/investment-products/investment-json';
import {
  PolicyConfiguration,
  RateConfiguration,
  RateWrite
} from '../../src/app/products/investment-products/investment-product.models';
export async function investmentSession(page: Page, permissions = ['ALL_FUNCTIONS'], userId = 2) {
  await page.addInitScript(
    ({ permissions, userId }) => {
      const credentials = {
        authenticated: true,
        username: 'synthetic-reviewer',
        userId,
        officeId: 1,
        officeName: 'Synthetic office',
        roles: [],
        permissions,
        base64EncodedAuthenticationKey: 'c3ludGhldGljOnN5bnRoZXRpYw==',
        shouldRenewPassword: false,
        rememberMe: true
      };
      localStorage.setItem('mifosXCredentials', JSON.stringify(credentials));
      localStorage.setItem('mifosXServerURL', location.origin);
      localStorage.setItem('mifosXTenantIdentifier', 'default');
      localStorage.setItem('mifosXLanguage', JSON.stringify({ name: 'English', code: 'en' }));
    },
    { permissions, userId }
  );
}
export async function investmentBackend(page: Page) {
  const state = {
    policy: structuredClone(configurationFixture),
    draft: structuredClone(rateFixture) as RateConfiguration | null,
    current: null as RateConfiguration | null,
    versions: [] as RateConfiguration[],
    writes: [] as { method: string; path: string; body: string }[],
    unavailable: false,
    conflict: false,
    publicationBlockers: [] as string[]
  };
  await page.route('**/fineract-provider/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.split('/api/v1')[1] ?? url.pathname;
    const respond = (body: unknown, status = 200) =>
      route.fulfill({ status, contentType: 'application/json', body: serializeInvestmentJson(body) });
    if (state.unavailable && path.includes('investment-products')) return respond({ errors: [] }, 502);
    if (request.method() !== 'GET')
      state.writes.push({ method: request.method(), path, body: request.postData() ?? '' });
    if (path === '/fixeddepositproducts')
      return respond([
        { id: 41, name: 'Synthetic Promissory Note', currency: { code: 'USD' } },
        { id: 42, name: 'Synthetic CEDE', currency: { code: 'USD' } },
        { id: 43, name: 'Synthetic unconfigured native product', currency: { code: 'USD' } }
      ]);
    if (path === '/investment-products/configuration/template') return respond(policyTemplateFixture);
    if (path === '/investment-products/configuration/41/validate')
      return respond({ ...state.policy, currentRevision: state.policy.revision });
    if (path === '/investment-products/configuration/41' && request.method() === 'PUT') {
      const body = parseInvestmentJson<{ policy: PolicyConfiguration['policy'] }>(request.postData()!);
      state.policy = {
        ...state.policy,
        revision: state.policy.revision + 1,
        policy: body.policy,
        status: 'DRAFT'
      } as PolicyConfiguration;
      return respond(state.policy);
    }
    if (/^\/investment-products\/configuration\/\d+$/.test(path)) {
      const id = Number(path.split('/').at(-1));
      return respond(
        id === 41
          ? state.policy
          : {
              ...configurationFixture,
              productId: id,
              revision: id === 43 ? 0 : 1,
              status: id === 43 ? 'UNCONFIGURED' : 'DRAFT',
              policy:
                id === 43
                  ? null
                  : {
                      ...configurationFixture.policy,
                      investmentType: 'CEDE',
                      minimumTermDays: 60,
                      maximumTermDays: 1800,
                      termMultipleDays: 30
                    }
            }
      );
    }
    if (path.endsWith('/rates/template')) return respond(rateTemplateFixture);
    if (path.endsWith('/rates/draft')) {
      if (request.method() === 'PUT') {
        if (state.conflict) return respond({ blockers: [] }, 409);
        const configuration = parseInvestmentJson<RateWrite>(request.postData()!);
        state.draft = {
          ...rateFixture,
          revision: (state.draft?.revision ?? 0) + 1,
          makerId: 2,
          configuration,
          blockers: configuration.campaignMetadata ? ['CAMPAIGN_APPLICABILITY_AND_PRECEDENCE_UNAPPROVED'] : []
        };
      }
      return state.draft ? respond(state.draft) : respond({}, 404);
    }
    if (path.endsWith('/rates/validate'))
      return respond({
        productId: 41,
        revision: state.draft?.revision ?? 0,
        valid: true,
        publishable: true,
        configuration: rateWriteFixture,
        blockers: []
      });
    if (path.endsWith('/rates/publish')) {
      if (state.publicationBlockers.length) return respond({ blockers: state.publicationBlockers }, 422);
      if (!state.draft) return respond({}, 404);
      const scheduled = state.draft.configuration.effectiveValidity.mode === 'SCHEDULED';
      const version: RateConfiguration = {
        ...state.draft,
        version: state.draft.revision,
        status: scheduled ? 'APPROVED_SCHEDULED' : 'APPROVED_EFFECTIVE',
        checkerId: 2,
        effectiveDate: scheduled ? state.draft.configuration.effectiveValidity.effectiveDate : '2026-11-19',
        effectiveInstant: scheduled ? '2026-12-10T06:00:00Z' : '2026-11-19T10:00:00Z',
        approvedAtUtc: '2026-11-19T10:00:00Z'
      };
      state.versions = [version];
      if (!scheduled) state.current = version;
      return respond(version);
    }
    if (/\/rates\/versions\/\d+$/.test(path))
      return respond(state.versions[0] ?? { ...rateFixture, version: 1, status: 'SUPERSEDED' });
    if (path.endsWith('/rates/versions')) return respond(state.versions);
    if (path.endsWith('/rates/schedule'))
      return respond(state.versions.filter((version) => version.status === 'APPROVED_SCHEDULED'));
    if (path.endsWith('/history')) return respond([]);
    if (path.endsWith('/rates/selection'))
      return respond({
        productId: 41,
        investmentType: 'PROMISSORY_NOTE',
        currencyCode: 'USD',
        investmentAmount: '1000',
        termDays: 60,
        asOfInstant: '2026-11-19T10:00:00Z',
        annualRatePercent: '14.000001',
        version: 1,
        amountBand: rateWriteFixture.matrix.amountBands[0],
        termBand: rateWriteFixture.matrix.termBands[0],
        effectiveDate: '2026-11-19',
        effectiveInstant: '2026-11-19T10:00:00Z',
        timezone: 'America/Mexico_City',
        campaignType: null,
        status: 'SELECTED_CONFIGURATION_ONLY',
        capabilities: rateTemplateFixture.capabilities,
        blockers: ['FINANCIAL_EXECUTION_UNAVAILABLE']
      });
    if (path.endsWith('/rates')) return respond(state.current);
    if (path.includes('/notifications')) return respond({ pageItems: [], totalFilteredRecords: 0 });
    if (path.includes('/configurations'))
      return respond(path === '/configurations' ? { globalConfiguration: [] } : { enabled: false });
    if (path.includes('/businessdate'))
      return respond({ date: [
          2026,
          11,
          19
        ] });
    if (path.endsWith('/theme')) return respond({}, 404);
    return respond([]);
  });
  return state;
}
