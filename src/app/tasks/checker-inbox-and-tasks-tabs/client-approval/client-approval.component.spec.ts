/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';

import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { FormDialogComponent } from 'app/shared/form-dialog/form-dialog.component';
import { TasksService } from '../../tasks.service';
import { ClientApprovalComponent } from './client-approval.component';

describe('ClientApprovalComponent', () => {
  let component: ClientApprovalComponent;
  let fixture: ComponentFixture<ClientApprovalComponent>;
  let dialog: jest.Mocked<MatDialog>;
  const businessDate = new Date(2026, 8, 8);

  afterEach(() => jest.useRealTimers());

  function createComponent(settings: { businessDate: Date }) {
    dialog = {
      open: jest.fn(() => ({ afterClosed: () => of({}) }))
    } as any;

    TestBed.configureTestingModule({
      imports: [
        ClientApprovalComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        { provide: ActivatedRoute, useValue: { data: of({ groupedClientData: { pageItems: [] } }) } },
        { provide: MatDialog, useValue: dialog },
        { provide: Dates, useValue: {} },
        { provide: TasksService, useValue: {} },
        { provide: SettingsService, useValue: settings },
        provideRouter([])
      ]
    });

    fixture = TestBed.createComponent(ClientApprovalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  it('opens the activation date dialog on the business date, capped at it, with Confirm enabled', () => {
    createComponent({ businessDate });

    component.approveClients();

    expect(dialog.open).toHaveBeenCalledWith(FormDialogComponent, {
      data: expect.objectContaining({
        pristine: false,
        formfields: [
          expect.objectContaining({ controlName: 'actDate', value: businessDate, maxDate: businessDate })
        ]
      })
    });
  });

  it('falls back to the current date when no business date is stored', () => {
    const today = new Date(2026, 8, 9);
    jest.useFakeTimers({ now: today });
    createComponent({ businessDate: new Date(NaN) });

    component.approveClients();

    const [actDate] = (dialog.open.mock.calls[0][1] as any).data.formfields;
    expect(actDate.value).toEqual(today);
    expect(actDate.maxDate).toBe(actDate.value);
  });
});
