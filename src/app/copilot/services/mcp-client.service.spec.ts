/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { lastValueFrom } from 'rxjs';
import { toArray } from 'rxjs/operators';
import { describe, it, expect, beforeEach } from '@jest/globals';

import { McpClientService } from './mcp-client.service';
import { COPILOT_CONFIG, DEFAULT_COPILOT_CONFIG } from '../copilot.config';
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';
import { McpChatRequest } from '../core/models/mcp-response.model';
import { CopilotContext } from '../core/models/copilot-context.model';

const CONTEXT: CopilotContext = {
  clientId: 42,
  clientName: 'Rajesh Kumar',
  loanId: 4521,
  screen: 'client-detail',
  loggedInUser: 'priya',
  role: 'Loan Officer',
  language: 'en'
};

function request(message: string): McpChatRequest {
  return { message, clientMsgId: 'msg-1', context: CONTEXT };
}

describe('McpClientService', () => {
  let service: McpClientService;
  let credentials: any;

  beforeEach(() => {
    credentials = { base64EncodedAuthenticationKey: 'bWlmb3M6cGFzc3dvcmQ=', username: 'priya' };
    TestBed.configureTestingModule({
      providers: [
        McpClientService,
        { provide: COPILOT_CONFIG, useValue: { ...DEFAULT_COPILOT_CONFIG, mcpBaseUrl: 'mock' } },
        { provide: AuthenticationService, useValue: { getCredentials: () => credentials } },
        { provide: SettingsService, useValue: { tenantIdentifier: 'default' } }
      ]
    });
    service = TestBed.inject(McpClientService);
  });

  it('serves fixtures when no gateway is configured', () => {
    expect(service.isMockMode).toBe(true);
  });

  it('streams a read flow ending in done (mock mode)', async () => {
    const events = await lastValueFrom(service.chat(request('Show loans for this client')).pipe(toArray()));

    const types = events.map((event) => event.type);
    expect(types).toContain('token');
    expect(types.at(-1)).toBe('done');
    expect(events.some((event) => event.card?.type === 'loan')).toBe(true);
  });

  it('pauses a write flow with a pending action card (mock mode)', async () => {
    const events = await lastValueFrom(service.chat(request('Approve this loan')).pipe(toArray()));

    const pending = events.find((event) => event.pendingAction);
    expect(pending?.pendingAction?.tool).toBe('fineract_loan_approve');
    // The stream pauses for confirmation — no done event yet.
    expect(events.map((event) => event.type)).not.toContain('done');
  });

  it('continues the paused turn through the decision endpoint (mock mode)', async () => {
    const events = await lastValueFrom(service.decision('card-1', 'approve', 'msg-2').pipe(toArray()));

    expect(events.map((event) => event.type)).toContain('token');
    expect(events.map((event) => event.type)).toContain('done');
  });

  it('builds Basic auth + tenant + correlation headers from the session', () => {
    const headers = (service as any).buildHeaders() as Record<string, string>;

    expect(headers['Authorization']).toBe('Basic bWlmb3M6cGFzc3dvcmQ=');
    expect(headers['Fineract-Platform-TenantId']).toBe('default');
    expect(headers['X-Correlation-Id']).toBeTruthy();
  });

  it('omits the Authorization header when no credentials exist', () => {
    credentials = null;
    const headers = (service as any).buildHeaders() as Record<string, string>;

    expect(headers['Authorization']).toBeUndefined();
    expect(headers['Fineract-Platform-TenantId']).toBe('default');
  });
});
