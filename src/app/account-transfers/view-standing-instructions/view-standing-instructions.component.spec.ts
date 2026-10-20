/**
 * Copyright since 2026 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ViewStandingInstructionsComponent } from './view-standing-instructions.component';

describe('ViewStandingInstructionsComponent', () => {
  /**
   * Builds the component for the given standing instruction, without rendering the template.
   * @param overrides Fields to override in the resolved standing instruction.
   * @returns The component.
   */
  function createComponent(overrides: any = {}): ViewStandingInstructionsComponent {
    const data = { fromClient: { id: 2 }, toClient: { id: 2 }, recurrenceOnDay: 5, recurrenceOnMonth: 7, ...overrides };
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: ActivatedRoute, useValue: { data: of({ standingInstructionsData: data }) } }]
    });
    return TestBed.runInInjectionContext(() => new ViewStandingInstructionsComponent());
  }

  it('should build the saved day of the month from recurrenceOnDay and recurrenceOnMonth', () => {
    expect(createComponent().recurrenceOnMonthDay).toEqual([
      2000,
      7,
      5
    ]);
  });

  it('should keep 29 February', () => {
    expect(createComponent({ recurrenceOnDay: 29, recurrenceOnMonth: 2 }).recurrenceOnMonthDay).toEqual([
      2000,
      2,
      29
    ]);
  });

  it('should be empty when no day is saved', () => {
    expect(createComponent({ recurrenceOnDay: 0, recurrenceOnMonth: 0 }).recurrenceOnMonthDay).toBeNull();
  });
});
