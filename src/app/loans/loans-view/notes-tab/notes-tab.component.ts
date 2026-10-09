/**
 * Copyright since 2025 Mifos Initiative
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';

/** Custom Components */

/** Custom Services */
import { LoansService } from '../../loans.service';
import { AuthenticationService } from '../../../core/authentication/authentication.service';
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
  private readonly destroyRef = inject(DestroyRef);
  private route = inject(ActivatedRoute);
  private loansService = inject(LoansService);
  private authenticationService = inject(AuthenticationService);
  private cdr = inject(ChangeDetectorRef);

  entityId: string;
  username: string;
  entityNotes: any;

  constructor() {
    const savedCredentials = this.authenticationService.getCredentials();
    this.username = savedCredentials.username;
    this.entityId = this.route.parent.snapshot.params['loanId'];
    this.addNote = this.addNote.bind(this);
    this.editNote = this.editNote.bind(this);
    this.deleteNote = this.deleteNote.bind(this);
    this.route.data.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((data: { loanNotes: any }) => {
      this.entityNotes = data.loanNotes;
    });
  }

  ngOnInit(): void {
    this.route.parent.params.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
      this.entityId = params['loanId'];
    });
  }

  addNote(noteContent: any) {
    this.loansService.createLoanNote(this.entityId, noteContent).subscribe((response: any) => {
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

  editNote(noteId: string, noteContent: any, index: number) {
    this.loansService.editLoanNote(this.entityId, noteId, noteContent).subscribe(() => {
      this.entityNotes = this.entityNotes.map((entityNote: any) =>
        entityNote.id === noteId ? { ...entityNote, note: noteContent.note } : entityNote
      );
      this.cdr.markForCheck();
    });
  }

  deleteNote(noteId: string, index: number) {
    this.loansService.deleteLoanNote(this.entityId, noteId).subscribe(() => {
      this.entityNotes = this.entityNotes.filter((entityNote: any) => entityNote.id !== noteId);
      this.cdr.markForCheck();
    });
  }
}
