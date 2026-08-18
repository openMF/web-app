/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ApplicationRef, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faEdit, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { describe, expect, it, jest } from '@jest/globals';
import { Subject, of } from 'rxjs';

import { AuthenticationService } from 'app/core/authentication/authentication.service';
import { Dates } from 'app/core/utils/dates';
import { SettingsService } from 'app/settings/settings.service';
import { CentersService } from 'app/centers/centers.service';
import { ClientsService } from 'app/clients/clients.service';
import { GroupsService } from 'app/groups/groups.service';
import { LoansService } from 'app/loans/loans.service';
import { SavingsService } from 'app/savings/savings.service';

import { NotesTabComponent as CenterNotesTabComponent } from 'app/centers/centers-view/notes-tab/notes-tab.component';
import { NotesTabComponent as ClientNotesTabComponent } from 'app/clients/clients-view/notes-tab/notes-tab.component';
import { NotesTabComponent as GroupNotesTabComponent } from 'app/groups/groups-view/notes-tab/notes-tab.component';
import { NotesTabComponent as LoanNotesTabComponent } from 'app/loans/loans-view/notes-tab/notes-tab.component';
import { NotesTabComponent as SavingsNotesTabComponent } from 'app/savings/savings-account-view/notes-tab/notes-tab.component';

/**
 * The notes tabs render their notes through the OnPush EntityNotesTabComponent, and the note
 * service responses arrive outside Angular's event handling. These specs drive each tab through
 * the DOM and only run change detection the way the framework does at runtime
 * (ApplicationRef.tick()), so a note list that is updated in place stays on screen unchanged -
 * which is the "the note is invisible until the page is reloaded" defect.
 */

interface NotesTabScenario {
  name: string;
  component: Type<any>;
  serviceToken: Type<any>;
  routeParams: { [key: string]: string };
  dataKey: string;
  createMethod: string;
  editMethod: string;
  deleteMethod: string;
}

const SCENARIOS: NotesTabScenario[] = [
  {
    name: 'Client Notes',
    component: ClientNotesTabComponent,
    serviceToken: ClientsService,
    routeParams: { clientId: '94' },
    dataKey: 'clientNotes',
    createMethod: 'createClientNote',
    editMethod: 'editClientNote',
    deleteMethod: 'deleteClientNote'
  },
  {
    name: 'Group Notes',
    component: GroupNotesTabComponent,
    serviceToken: GroupsService,
    routeParams: { groupId: '12' },
    dataKey: 'groupNotes',
    createMethod: 'createGroupNote',
    editMethod: 'editGroupNote',
    deleteMethod: 'deleteGroupNote'
  },
  {
    name: 'Center Notes',
    component: CenterNotesTabComponent,
    serviceToken: CentersService,
    routeParams: { centerId: '5' },
    dataKey: 'centerNotes',
    createMethod: 'createCenterNote',
    editMethod: 'editCenterNote',
    deleteMethod: 'deleteCenterNote'
  },
  {
    name: 'Loan Notes',
    component: LoanNotesTabComponent,
    serviceToken: LoansService,
    routeParams: { loanId: '77' },
    dataKey: 'loanNotes',
    createMethod: 'createLoanNote',
    editMethod: 'editLoanNote',
    deleteMethod: 'deleteLoanNote'
  },
  {
    name: 'Savings Account Notes',
    component: SavingsNotesTabComponent,
    serviceToken: SavingsService,
    routeParams: { savingAccountId: '33' },
    dataKey: 'savingAccountNotes',
    createMethod: 'createSavingsNote',
    editMethod: 'editSavingsNote',
    deleteMethod: 'deleteSavingsNote'
  }
];

describe('Notes tabs render note changes without a page reload', () => {
  let fixture: ComponentFixture<any>;
  let appRef: ApplicationRef;
  let dialogResponse: any;

  /** Response of the note request under test, held open so it resolves outside event handling. */
  let pendingResponse: Subject<any>;

  const noteServiceMock = (scenario: NotesTabScenario) => ({
    [scenario.createMethod]: jest.fn(() => pendingResponse),
    [scenario.editMethod]: jest.fn(() => pendingResponse),
    [scenario.deleteMethod]: jest.fn(() => pendingResponse)
  });

  const setup = async (scenario: NotesTabScenario) => {
    pendingResponse = new Subject<any>();
    dialogResponse = {};

    const parentRoute: any = {
      snapshot: { params: scenario.routeParams },
      params: of(scenario.routeParams)
    };
    parentRoute.parent = parentRoute;

    const entityServices = [
      ClientsService,
      GroupsService,
      CentersService,
      LoansService,
      SavingsService
    ].map((token) => ({
      provide: token,
      useValue: token === scenario.serviceToken ? noteServiceMock(scenario) : {}
    }));

    await TestBed.configureTestingModule({
      imports: [
        scenario.component,
        TranslateModule.forRoot()
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            data: of({
              [scenario.dataKey]: [{ id: 1, note: 'first note', createdByUsername: 'mifos', createdOn: new Date() }]
            }),
            snapshot: { params: scenario.routeParams },
            params: of(scenario.routeParams),
            parent: parentRoute
          }
        },
        { provide: AuthenticationService, useValue: { getCredentials: () => ({ username: 'mifos' }) } },
        { provide: MatDialog, useValue: { open: () => ({ afterClosed: () => of(dialogResponse) }) } },
        { provide: SettingsService, useValue: { dateFormat: 'dd MMMM yyyy', language: { code: 'en' } } },
        {
          provide: Dates,
          useValue: { angularToMomentFormat: () => 'DD MMMM YYYY', getMomentLocale: () => 'en' }
        },
        ...entityServices,
        provideAnimationsAsync()
      ]
    }).compileComponents();

    TestBed.inject(FaIconLibrary).addIcons(faPlus, faEdit, faTrash);
    appRef = TestBed.inject(ApplicationRef);
    fixture = TestBed.createComponent(scenario.component);
    appRef.attachView(fixture.componentRef.hostView);
    fixture.detectChanges();
  };

  const renderedNotes = (): string[] =>
    Array.from(fixture.nativeElement.querySelectorAll('.note-card .note-content')).map((element: any) =>
      element.textContent.trim()
    );

  const submitNewNote = (text: string) => {
    const textarea: HTMLTextAreaElement = fixture.nativeElement.querySelector('textarea');
    textarea.value = text;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  const clickNoteAction = (index: number, action: 'edit' | 'delete') => {
    const buttons = fixture.nativeElement.querySelectorAll('.note-card .note-actions button');
    buttons[index * 2 + (action === 'edit' ? 0 : 1)].click();
    fixture.detectChanges();
  };

  SCENARIOS.forEach((scenario) => {
    describe(scenario.name, () => {
      it('shows an added note as soon as the request completes', async () => {
        await setup(scenario);
        expect(renderedNotes()).toEqual(['first note']);

        submitNewNote('second note');
        pendingResponse.next({ resourceId: 2 });
        appRef.tick();

        expect(renderedNotes()).toEqual([
          'first note',
          'second note'
        ]);
      });

      it('shows an edited note as soon as the request completes', async () => {
        await setup(scenario);

        dialogResponse = { data: { value: { note: 'updated note' } } };
        clickNoteAction(0, 'edit');
        pendingResponse.next({});
        appRef.tick();

        expect(renderedNotes()).toEqual(['updated note']);
      });

      it('removes a deleted note as soon as the request completes', async () => {
        await setup(scenario);

        dialogResponse = { delete: true };
        clickNoteAction(0, 'delete');
        pendingResponse.next({});
        appRef.tick();

        expect(renderedNotes()).toEqual([]);
      });
    });
  });
});
