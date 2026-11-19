/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { describe, it, expect } from '@jest/globals';
import { expandArrays, mapperPath, renderTemplate } from './template-merge';

describe('mapperPath', () => {
  it('fills the loan id and keeps the path under the API prefix', () => {
    expect(mapperPath('v1/loans/{{loanId}}?associations=all&tenantIdentifier=default', { loanId: 7 })).toBe(
      '/v1/loans/7?associations=all&tenantIdentifier=default'
    );
  });

  it('takes a full URL to the same API as its path', () => {
    expect(mapperPath('https://10.0.0.1/fineract-provider/api/v1/loans/{{loanId}}', { loanId: 7 })).toBe('/v1/loans/7');
  });
});

describe('renderTemplate', () => {
  const loan = expandArrays({
    clientName: 'Suresh <Basnet>',
    principal: 500000,
    group: null,
    timeline: { submittedOnDate: [
        2026,
        11,
        19
      ] },
    guarantors: [
      {
        firstname: 'Ram',
        lastname: 'K',
        guarantorFundingDetails: [{ amount: 100, savingsAccount: { accountNo: 'S1' } }]
      },
      {
        firstname: 'Sita',
        lastname: 'B',
        guarantorFundingDetails: [{ amount: 200, savingsAccount: { accountNo: 'S2' } }]
      }
    ]
  });
  const form = expandArrays({ data: [{ row: [
          1019,
          'Tea shop'
        ] }] });

  it('fills values, escaping HTML, and leaves missing ones empty', () => {
    expect(renderTemplate('<b>{{loan.clientName}}</b> {{loan.principal}} [{{loan.group.name}}]', { loan })).toBe(
      '<b>Suresh &lt;Basnet&gt;</b> 500000 []'
    );
  });

  it('reads arrays by position, as Fineract does', () => {
    expect(
      renderTemplate('{{loan.timeline.submittedOnDate#0}}-{{loan.timeline.submittedOnDate#1}} {{form.data#0.row#1}}', {
        loan,
        form
      })
    ).toBe('2026-11 Tea shop');
  });

  it('repeats a section per item, nested, with outer names still reachable', () => {
    const text =
      '<!-- {{#loan.guarantors}} --><tr>{{#guarantorFundingDetails}}<td>{{firstname}}</td>' +
      '<td>{{savingsAccount.accountNo}}</td><td>{{amount}}</td>{{/guarantorFundingDetails}}</tr><!-- {{/loan.guarantors}} -->';
    expect(renderTemplate(text, { loan })).toBe(
      '<!--  --><tr><td>Ram</td><td>S1</td><td>100</td></tr><!--  -->' +
        '<tr><td>Sita</td><td>S2</td><td>200</td></tr><!--  -->'
    );
  });

  it('shows an inverted section only when the value is empty, and drops comments', () => {
    expect(renderTemplate('{{^loan.group}}individual{{/loan.group}}{{! note }}', { loan })).toBe('individual');
  });
  it('picks a list item by a field, as a value or a section', () => {
    const family = [
      { firstName: 'Hari', lastName: 'Basnet', relationship: 'Father' },
      { firstName: 'Test', lastName: 'Bahadur', relationship: 'Grandfather' }
    ];
    expect(
      renderTemplate(
        '{{#family[relationship=grandfather]}}{{firstName}} {{lastName}}{{/family[relationship=grandfather]}} / ' +
          '{{family[relationship=Father].firstName}} / [{{family[relationship=Mother].firstName}}]',
        { family }
      )
    ).toBe('Test Bahadur / Hari / []');
  });
});
