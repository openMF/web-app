import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJournalEntryTransactionComponent } from './view-journal-entry-transaction.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';

describe('ViewJournalEntryTransactionComponent', () => {
  let component: ViewJournalEntryTransactionComponent;
  let fixture: ComponentFixture<ViewJournalEntryTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewJournalEntryTransactionComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewJournalEntryTransactionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
