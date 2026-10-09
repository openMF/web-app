/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';

import { connectionProbeVerdict } from './connection-probe-verdict';
import { TestConnectionResponse } from './models/tenant.model';

const CREATING = false;
const EDITING = true;

function probe(fields: Partial<TestConnectionResponse>): TestConnectionResponse {
  return {
    reachable: false,
    serverReachable: true,
    credentialsAccepted: true,
    schemaPresent: false,
    ...fields
  };
}

describe('connectionProbeVerdict', () => {
  it('reads an absent database as healthy while creating and as a problem while editing', () => {
    // The same answer, opposite meanings: a tenant being created has no database yet, while a
    // tenant being edited has lost one.
    const answer = probe({ schemaPresent: false });

    expect(connectionProbeVerdict(answer, CREATING)).toEqual({
      key: 'labels.text.Database will be created on submit',
      tone: 'success'
    });
    expect(connectionProbeVerdict(answer, EDITING)).toEqual({
      key: 'labels.text.Tenant database is missing',
      tone: 'error'
    });
  });

  it('says an existing database will be reused while creating', () => {
    const answer = probe({ reachable: true, schemaPresent: true });

    expect(connectionProbeVerdict(answer, CREATING)).toEqual({
      key: 'labels.text.Existing database will be reused',
      tone: 'success'
    });
    expect(connectionProbeVerdict(answer, EDITING)).toEqual({
      key: 'labels.text.Tenant database answered',
      tone: 'success'
    });
  });

  it('reports refused credentials whichever form is asking', () => {
    const answer = probe({ credentialsAccepted: false });

    for (const expectExisting of [
      CREATING,
      EDITING
    ]) {
      expect(connectionProbeVerdict(answer, expectExisting)).toEqual({
        key: 'labels.text.Database server refused the credentials',
        tone: 'error'
      });
    }
  });

  it('reports an unreachable server before anything else', () => {
    // Nothing answered, so nothing can be claimed about the credentials or the database.
    const answer = probe({ serverReachable: false, credentialsAccepted: false });

    expect(connectionProbeVerdict(answer, CREATING)).toEqual({
      key: 'labels.text.Database server did not answer',
      tone: 'error'
    });
  });
});
