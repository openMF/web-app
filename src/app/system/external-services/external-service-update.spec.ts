/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';

import { buildExternalServiceUpdate, MASKED_EXTERNAL_SERVICE_PROPERTIES } from './external-service-update';

describe('buildExternalServiceUpdate', () => {
  const loaded = { username: 'mailer', password: '', host: 'smtp.example.com', port: '587' };

  it('lists the properties Fineract masks on GET', () => {
    expect(MASKED_EXTERNAL_SERVICE_PROPERTIES.SMTP).toEqual(['password']);
    expect(MASKED_EXTERNAL_SERVICE_PROPERTIES.NOTIFICATION).toEqual(['server_key']);
  });

  it('sends nothing when nothing changed', () => {
    expect(buildExternalServiceUpdate(loaded, { ...loaded }, ['password'])).toEqual({});
  });

  it('sends only the changed properties', () => {
    expect(buildExternalServiceUpdate(loaded, { ...loaded, host: 'mail.example.com' }, ['password'])).toEqual({
      host: 'mail.example.com'
    });
  });

  it('sends a masked property only when a value was typed', () => {
    expect(buildExternalServiceUpdate(loaded, { ...loaded, password: 'n3w-secret' }, ['password'])).toEqual({
      password: 'n3w-secret'
    });
  });

  it('leaves a blank masked property out, so the stored secret is kept', () => {
    const update = buildExternalServiceUpdate(loaded, { ...loaded, port: '25', password: '' }, ['password']);

    expect(update).toEqual({ port: '25' });
  });
});
