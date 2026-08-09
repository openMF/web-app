/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

/** Angular Imports */
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

/** Custom Services */
import { AuthenticationService } from '../../core/authentication/authentication.service';
import { SettingsService } from 'app/settings/settings.service';

/** Environment */
import { environment } from '../../../environments/environment';

/** Copilot Core */
import { COPILOT_CONFIG } from '../copilot.config';
import { McpClient } from '../core/mcp-client';
import { McpChatRequest, McpStreamEvent } from '../core/models/mcp-response.model';
import { mockChatStream, mockDecisionStream } from './mcp-fixtures';

/**
 * DI wrapper around the framework-agnostic core McpClient.
 *
 * Responsibilities:
 *  - build the per-request headers (Authorization, tenant, correlation id) —
 *    the app's AuthenticationInterceptor only covers the Fineract origin, so
 *    the Copilot transport must set them itself;
 *  - adapt the async event stream into an RxJS Observable whose unsubscribe
 *    aborts the underlying fetch (this is how "stop" works);
 *  - serve the mock transport when no gateway is configured
 *    (copilotMcpBaseUrl = 'mock'), so the UI works before deployment.
 */
@Injectable({ providedIn: 'root' })
export class McpClientService {
  private readonly config = inject(COPILOT_CONFIG);
  private readonly authenticationService = inject(AuthenticationService);
  private readonly settingsService = inject(SettingsService);

  private client?: McpClient;

  /** True when no real gateway is configured and fixtures answer instead. */
  get isMockMode(): boolean {
    const url = (this.config.mcpBaseUrl ?? '').trim().toLowerCase();
    return url === '' || url === 'mock';
  }

  /** Stream a chat turn as Observable events; unsubscribing cancels the request. */
  chat(request: McpChatRequest): Observable<McpStreamEvent> {
    if (this.isMockMode) {
      return this.toObservable(() => mockChatStream(request));
    }
    return this.toObservable((signal) => this.mcpClient().chat(request, this.buildHeaders(), signal));
  }

  /** Approve/reject a pending action; the stream continues the paused turn. */
  decision(cardId: string, decision: 'approve' | 'reject', clientMsgId: string): Observable<McpStreamEvent> {
    if (this.isMockMode) {
      return this.toObservable(() => mockDecisionStream(cardId, decision));
    }
    return this.toObservable((signal) =>
      this.mcpClient().decision(cardId, { decision, clientMsgId }, this.buildHeaders(), signal)
    );
  }

  private mcpClient(): McpClient {
    if (!this.client) {
      this.client = new McpClient({
        baseUrl: this.gatewayBaseUrl(),
        firstTokenTimeoutMs: this.config.firstTokenTimeoutMs
      });
    }
    return this.client;
  }

  /**
   * The gateway URL comes from runtime config (env.js), and the officer's Authorization
   * header is sent to it, so only an absolute http(s) origin is accepted. http is allowed
   * for localhost during development; anything else must be https.
   */
  private gatewayBaseUrl(): string {
    const configured = (this.config.mcpBaseUrl ?? '').trim();
    let url: URL;
    try {
      url = new URL(configured);
    } catch {
      throw new Error(`Invalid copilotMcpBaseUrl: "${configured}". Expected an absolute http(s) URL.`);
    }
    const isLocalhost = url.hostname === 'localhost' || url.hostname === '127.0.0.1';
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && isLocalhost)) {
      throw new Error(`Refusing to send credentials to a non-HTTPS Copilot gateway: "${configured}".`);
    }
    return configured;
  }

  /**
   * Headers per wire contract v1. Tokens are sent as headers, never in query
   * strings (they would leak into proxy/access logs).
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Fineract-Platform-TenantId': this.settingsService.tenantIdentifier || environment.fineractPlatformTenantId,
      'X-Correlation-Id': this.correlationId()
    };
    // Prefer the OAuth access token whenever one exists — environment flags may not reflect
    // the runtime auth mode (OIDC can be enabled via env.js), but an accessToken on the
    // credentials is definitive. Basic key is the fallback for Basic-auth deployments.
    const credentials = this.authenticationService.getCredentials();
    if (credentials?.accessToken) {
      headers['Authorization'] = `Bearer ${credentials.accessToken}`;
    } else if (credentials?.base64EncodedAuthenticationKey) {
      headers['Authorization'] = `Basic ${credentials.base64EncodedAuthenticationKey}`;
    }
    return headers;
  }

  private correlationId(): string {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
      return crypto.randomUUID();
    }
    return `cop-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  }

  /** Adapt an async event generator to an Observable; teardown aborts the fetch. */
  private toObservable(factory: (signal: AbortSignal) => AsyncIterable<McpStreamEvent>): Observable<McpStreamEvent> {
    return new Observable<McpStreamEvent>((subscriber) => {
      const controller = new AbortController();
      (async () => {
        try {
          for await (const event of factory(controller.signal)) {
            if (controller.signal.aborted) {
              break;
            }
            subscriber.next(event);
          }
          subscriber.complete();
        } catch (error) {
          subscriber.error(error);
        }
      })();
      return () => controller.abort();
    });
  }
}
