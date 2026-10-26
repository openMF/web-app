/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { AuthenticationService } from '../../../core/authentication/authentication.service';
import { CentersService } from '../../centers.service';
import { EntityNotesTabComponent } from '../../../shared/tabs/entity-notes-tab/entity-notes-tab.component';
import { STANDALONE_SHARED_IMPORTS } from 'app/standalone-shared.module';

@Component({
  selector: 'mifosx-notes-tab',
  templateUrl: './notes-tab.component.html',
  styleUrls: ['./notes-tab.component.scss'],
  imports: [
    ...STANDALONE_SHARED_IMPORTS,
    EntityNotesTabComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class NotesTabComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private authenticationService = inject(AuthenticationService);
  private centersService = inject(CentersService);
  private cdr = inject(ChangeDetectorRef);

  entityId: string;
  username: string;
  entityNotes: any;

  constructor() {
    this.entityId = this.route.parent.parent.snapshot.params['centerId'];
    this.addNote = this.addNote.bind(this);
    this.editNote = this.editNote.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
  }

  ngOnInit() {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.route.data.subscribe((data: { centerNotes: any }) => {
      this.entityNotes = data.centerNotes;
    });
  }

  addNote(noteContent: any) {
    this.centersService.createCenterNote(this.entityId, noteContent).subscribe((response: any) => {
      this.entityNotes = [
        ...this.entityNotes,
        {
          id: response.resourceId,
          createdByUsername: this.username,
          createdOn: new Date(),
          note: noteContent.note
        }
      ];
      this.cdr.markForCheck();
    });
  }

  editNote(noteId: number, noteContent: any, index: number) {
    this.centersService.editCenterNote(this.entityId, String(noteId), noteContent).subscribe(() => {
      this.entityNotes = this.entityNotes.map((entityNote: any) =>
        entityNote.id === noteId ? { ...entityNote, note: noteContent.note } : entityNote
      );
      this.cdr.markForCheck();
    });
  }

  deleteNote(noteId: number, index: number) {
    this.centersService.deleteCenterNote(this.entityId, String(noteId)).subscribe(() => {
      this.entityNotes = this.entityNotes.filter((entityNote: any) => entityNote.id !== noteId);
      this.cdr.markForCheck();
    });
  }
}
