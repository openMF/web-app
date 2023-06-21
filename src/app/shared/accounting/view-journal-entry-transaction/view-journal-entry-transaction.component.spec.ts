import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewJournalEntryTransactionComponent } from './view-journal-entry-transaction.component';

describe('ViewJournalEntryTransactionComponent', () => {
  let component: ViewJournalEntryTransactionComponent;
  let fixture: ComponentFixture<ViewJournalEntryTransactionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ViewJournalEntryTransactionComponent ]
    })
    .compileComponents();
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
