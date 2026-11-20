/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { TranslateModule } from '@ngx-translate/core';
import { FinancialPolicySummaryComponent } from './financial-policy-summary.component';
import { FinancialCapabilitiesComponent } from './financial-capabilities.component';
import { policy } from './product-policy.fixtures';
import { FinancialCapabilitiesComponent as Capabilities } from './financial-capabilities.component';

describe('Financial configuration and capability presentation', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({ imports: [TranslateModule.forRoot()], providers: [provideNoopAnimations()] })
  );
  it('keeps exact monetary text in the summary and does not fabricate missing charge names', () => {
    const fixture = TestBed.createComponent(FinancialPolicySummaryComponent);
    fixture.componentInstance.policy = {
      ...policy,
      maximumBalance: '9999999999999.999999',
      feeApplicable: true,
      feeChargeId: 7
    };
    fixture.componentInstance.currency = 'MXN';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('MXN 9999999999999.999999');
    expect(fixture.nativeElement.textContent).toContain('SavingsEditor.Unavailable');
    expect(fixture.nativeElement.textContent).toContain('FinancialControls.ConfigurationNotice');
  });
  it('distinguishes absent approved policy from a configured draft', () => {
    const fixture = TestBed.createComponent(FinancialPolicySummaryComponent);
    fixture.componentInstance.title = 'FinancialControls.Active';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('FinancialControls.Active');
    expect(fixture.nativeElement.textContent).toContain('SavingsEditor.NoActive');
    expect(fixture.nativeElement.querySelector('dl')).toBeNull();
  });
  it('reports partial event coverage independently of unsupported financial capabilities', () => {
    const fixture = TestBed.createComponent(FinancialCapabilitiesComponent);
    fixture.componentInstance.capabilities = {
      decisionEvaluation: true,
      depositEventVeto: 'PARTIALLY_ENFORCED',
      withdrawalEventVeto: 'PARTIALLY_ENFORCED',
      maximumBalanceEnforcement: false,
      freezingLifecycle: false,
      operationsExceptions: false,
      universalNativeCoverage: false,
      configuredActivation: false,
      blockers: ['NATIVE_ADJUSTMENT_AND_REVERSAL_HAVE_NO_VALIDATION_EVENT']
    };
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.match(/FinancialControls.Codes.PARTIALLY_ENFORCED/g)).toHaveLength(2);
    expect(fixture.nativeElement.textContent).toContain('FinancialControls.Unsupported');
    expect(fixture.nativeElement.textContent).toContain(
      'FinancialControls.Codes.NATIVE_ADJUSTMENT_AND_REVERSAL_HAVE_NO_VALIDATION_EVENT'
    );
  });
  it('does not assume capability support when an older deployment omits BE-06', () => {
    const fixture = TestBed.createComponent(Capabilities);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('FinancialControls.CapabilitiesUnavailable');
    expect(fixture.componentInstance.support(undefined)).toBe('SavingsEditor.Unavailable');
  });
});
