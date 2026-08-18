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
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Observable, Subject, of } from 'rxjs';

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
 *
 * They also hold two requests open at once and complete them out of order, which is where a
 * callback that trusts the render index it was called with resolves against the wrong note.
 */

/** Note as the tabs hold it: resolver rows and locally appended rows share this shape. */
interface NoteRecord {
  id: number;
  note: string;
  createdByUsername: string;
  createdOn: Date;
}

interface NoteContent {
  note: string;
}

/** Only `resourceId` is read, and only from the create response. */
interface NoteRequestResponse {
  resourceId?: number;
}

/**
 * The surface of a notes tab that these specs rely on. `noteId` is `string | number` because the
 * tabs declare it differently - centers types it as the numeric id the template actually passes,
 * the others still declare `string` - while every one of them receives `entityNote.id` at runtime.
 */
interface NotesTab {
  entityId: string;
  entityNotes: NoteRecord[];
  addNote(noteContent: NoteContent): void;
  editNote(noteId: string | number, noteContent: NoteContent, index: number): void;
  deleteNote(noteId: string | number, index: number): void;
}

/** Entity service double: only the three note methods of the tab under test are stubbed. */
type NoteServiceDouble = Record<string, () => Observable<NoteRequestResponse>>;

/** What the shared component reads back from its edit and delete dialogs. */
interface NoteDialogResponse {
  data?: { value: NoteContent };
  delete?: boolean;
}

type RouteParams = Record<string, string>;

interface ParentRouteDouble {
  snapshot: { params: RouteParams };
  params: Observable<RouteParams>;
  parent?: ParentRouteDouble;
}

interface ActivatedRouteDouble extends ParentRouteDouble {
  data: Observable<Record<string, NoteRecord[]>>;
  parent: ParentRouteDouble;
}

interface NotesTabScenario {
  name: string;
  component: Type<NotesTab>;
  serviceToken: Type<unknown>;
  routeParams: RouteParams;
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

/**
 * Note actions carry their own test id in the shared component, so looking one up inside its own
 * card keeps the lookup independent of button order, button count and translated labels.
 */
const ACTION_TESTID: Record<'edit' | 'delete', string> = {
  edit: 'note-edit-action',
  delete: 'note-delete-action'
};

const noteRecord = (id: number, note: string): NoteRecord => ({
  id,
  note,
  createdByUsername: 'mifos',
  createdOn: new Date()
});

describe('Notes tabs render note changes without a page reload', () => {
  let fixture: ComponentFixture<NotesTab>;
  let appRef: ApplicationRef;
  let dialogResponse: NoteDialogResponse;

  /** Every note request opened so far, in call order, each still awaiting its response. */
  let openRequests: Subject<NoteRequestResponse>[];

  /** Opens a request that stays pending until the spec completes it explicitly. */
  const openRequest = (): Observable<NoteRequestResponse> => {
    const response = new Subject<NoteRequestResponse>();
    openRequests.push(response);
    return response.asObservable();
  };

  /** Completes the request opened `order`-th, outside any event handler. */
  const completeRequest = (order: number, response: NoteRequestResponse = {}) => {
    openRequests[order].next(response);
  };

  /** Completes anything a test left pending, so no subscription outlives its spec. */
  afterEach(() => {
    (openRequests ?? []).forEach((request) => request.complete());
    openRequests = [];
  });

  const noteServiceDouble = (scenario: NotesTabScenario): NoteServiceDouble => ({
    [scenario.createMethod]: jest.fn(openRequest),
    [scenario.editMethod]: jest.fn(openRequest),
    [scenario.deleteMethod]: jest.fn(openRequest)
  });

  const setup = async (scenario: NotesTabScenario, notes: NoteRecord[] = [noteRecord(1, 'first note')]) => {
    openRequests = [];
    dialogResponse = {};

    const parentRoute: ParentRouteDouble = {
      snapshot: { params: scenario.routeParams },
      params: of(scenario.routeParams)
    };
    parentRoute.parent = parentRoute;

    const route: ActivatedRouteDouble = {
      data: of({ [scenario.dataKey]: notes }),
      snapshot: { params: scenario.routeParams },
      params: of(scenario.routeParams),
      parent: parentRoute
    };

    const entityServices = [
      ClientsService,
      GroupsService,
      CentersService,
      LoansService,
      SavingsService
    ].map((token) => ({
      provide: token,
      useValue: token === scenario.serviceToken ? noteServiceDouble(scenario) : {}
    }));

    await TestBed.configureTestingModule({
      imports: [
        scenario.component,
        TranslateModule.forRoot()
      ],
      providers: [
        { provide: ActivatedRoute, useValue: route },
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

  const host = (): HTMLElement => fixture.nativeElement as HTMLElement;

  const noteCards = (): HTMLElement[] => Array.from(host().querySelectorAll<HTMLElement>('.note-card'));

  const renderedNotes = (): string[] =>
    noteCards().map((card) => card.querySelector('.note-content')?.textContent?.trim() ?? '');

  const cardFor = (noteText: string): HTMLElement => {
    const card = noteCards().find(
      (candidate) => candidate.querySelector('.note-content')?.textContent?.trim() === noteText
    );
    if (!card) {
      throw new Error(`No rendered note card for "${noteText}". Rendered: ${JSON.stringify(renderedNotes())}`);
    }
    return card;
  };

  const submitNewNote = (text: string) => {
    const textarea = host().querySelector('textarea') as HTMLTextAreaElement;
    textarea.value = text;
    textarea.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    (host().querySelector('form') as HTMLFormElement).dispatchEvent(new Event('submit'));
    fixture.detectChanges();
  };

  /** Clicks an action on the card showing `noteText`, identified by the action's own test id. */
  const clickNoteAction = (noteText: string, action: 'edit' | 'delete') => {
    const selector = `button[data-testid="${ACTION_TESTID[action]}"]`;
    const button = cardFor(noteText).querySelector<HTMLButtonElement>(selector);
    if (!button) {
      throw new Error(`No "${action}" action on the note card for "${noteText}"`);
    }
    button.click();
    fixture.detectChanges();
  };

  const startEdit = (noteText: string, updatedText: string) => {
    dialogResponse = { data: { value: { note: updatedText } } };
    clickNoteAction(noteText, 'edit');
  };

  const startDelete = (noteText: string) => {
    dialogResponse = { delete: true };
    clickNoteAction(noteText, 'delete');
  };

  SCENARIOS.forEach((scenario) => {
    describe(scenario.name, () => {
      it('shows an added note as soon as the request completes', async () => {
        await setup(scenario);
        expect(renderedNotes()).toEqual(['first note']);

        submitNewNote('second note');
        completeRequest(0, { resourceId: 2 });
        appRef.tick();

        expect(renderedNotes()).toEqual([
          'first note',
          'second note'
        ]);
      });

      it('shows an edited note as soon as the request completes', async () => {
        await setup(scenario);

        startEdit('first note', 'updated note');
        completeRequest(0);
        appRef.tick();

        expect(renderedNotes()).toEqual(['updated note']);
      });

      it('removes a deleted note as soon as the request completes', async () => {
        await setup(scenario);

        startDelete('first note');
        completeRequest(0);
        appRef.tick();

        expect(renderedNotes()).toEqual([]);
      });

      it('edits the note it was asked to edit when an earlier request completes first', async () => {
        await setup(scenario, [
          noteRecord(1, 'note A'),
          noteRecord(2, 'note B'),
          noteRecord(3, 'note C')
        ]);

        startEdit('note C', 'note C updated');
        startDelete('note A');

        completeRequest(1);
        appRef.tick();
        completeRequest(0);
        appRef.tick();

        expect(renderedNotes()).toEqual([
          'note B',
          'note C updated'
        ]);
      });

      it('deletes the note it was asked to delete when an earlier request completes first', async () => {
        await setup(scenario, [
          noteRecord(1, 'note A'),
          noteRecord(2, 'note B'),
          noteRecord(3, 'note C')
        ]);

        startDelete('note C');
        startDelete('note A');

        completeRequest(1);
        appRef.tick();
        completeRequest(0);
        appRef.tick();

        expect(renderedNotes()).toEqual(['note B']);
      });
    });
  });
});
