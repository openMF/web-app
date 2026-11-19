/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { FormBuilder } from '@angular/forms';
import { InvestmentRateMatrixComponent, matrixForm, readMatrixForm } from './investment-rate-matrix.component';
import { rateTemplateFixture, rateWriteFixture } from './investment-product.fixtures';
describe('InvestmentRateMatrixComponent', () => {
  let component: InvestmentRateMatrixComponent;
  beforeEach(() => {
    const fb = new FormBuilder();
    component = new InvestmentRateMatrixComponent(fb);
    component.form = matrixForm(fb, rateWriteFixture.matrix);
    component.template = rateTemplateFixture;
    component.editable = true;
  });
  it('renders existing cells without losing decimal text', () =>
    expect(component.rates.at(0).at(0).value).toBe('14.000001'));
  it('expands both axes and preserves existing cells', () => {
    component.addAmount();
    component.addTerm();
    expect(component.rates.length).toBe(2);
    expect(component.rates.at(0).length).toBe(2);
    expect(component.rates.at(0).at(0).value).toBe('14.000001');
    expect(component.rates.at(1).at(1).value).toBe('');
    expect(component.form.dirty).toBe(true);
  });
  it('reindexes after removing bands', () => {
    component.addAmount();
    component.addTerm();
    component.rates.at(1).at(1).setValue('7.125');
    component.removeAmount(0);
    component.removeTerm(0);
    expect(readMatrixForm(component.form, 'USD').cells).toEqual([
      { amountBand: 0, termBand: 0, annualRatePercent: '7.125' }
    ]);
  });
  it('does not remove the last band', () => {
    component.removeAmount(0);
    component.removeTerm(0);
    expect(component.amounts.length).toBe(1);
    expect(component.terms.length).toBe(1);
  });
  it('enforces read-only and saving states', () => {
    component.editable = false;
    component.addAmount();
    expect(component.amounts.length).toBe(1);
    component.editable = true;
    component.busy = true;
    component.addTerm();
    expect(component.terms.length).toBe(1);
  });
  it('uses the server cell limit', () => {
    component.template = { ...rateTemplateFixture, maximumCells: 1 };
    expect(component.canAddAmount).toBe(false);
    expect(component.canAddTerm).toBe(false);
  });
});
