/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { EMPTY, of } from 'rxjs';
import { CentersViewComponent } from './centers-view.component';
import { CentersService } from '../centers.service';
import { DataReloadService } from 'app/core/services/data-reload.service';

import { TranslateModule } from '@ngx-translate/core';
import { describe, it, expect, jest, beforeEach } from '@jest/globals';

describe('CentersViewComponent', () => {
  let component: CentersViewComponent;
  let fixture: ComponentFixture<CentersViewComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        CentersViewComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { data: of({ centerViewData: { id: 7, name: 'Kampala Center' }, centerDatatables: [] }) }
        },
        { provide: MatDialog, useValue: { open: jest.fn() } },
        { provide: CentersService, useValue: {} },
        { provide: DataReloadService, useValue: { getReloadObservable: jest.fn(() => EMPTY), cleanup: jest.fn() } }
      ]
    })
      // Only the component's action handling is under test here.
      .overrideComponent(CentersViewComponent, { set: { template: '' } })
      .compileComponents();

    router = TestBed.inject(Router);
    jest.spyOn(router, 'navigate').mockResolvedValue(true);

    fixture = TestBed.createComponent(CentersViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should open group creation for this center on Add Group', () => {
    component.doAction('Add Group');

    expect(router.navigate).toHaveBeenCalledWith(['/groups/create'], { queryParams: { centerId: 7 } });
  });
});
