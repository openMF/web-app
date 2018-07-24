import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchJournalEntryComponent } from './search-journal-entry.component';

describe('SearchJournalEntryComponent', () => {
  let component: SearchJournalEntryComponent;
  let fixture: ComponentFixture<SearchJournalEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SearchJournalEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchJournalEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
