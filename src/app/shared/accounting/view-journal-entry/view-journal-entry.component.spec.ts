import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJournalEntryComponent } from './view-journal-entry.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('ViewJournalEntryComponent', () => {
  let component: ViewJournalEntryComponent;
  let fixture: ComponentFixture<ViewJournalEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewJournalEntryComponent],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewJournalEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
