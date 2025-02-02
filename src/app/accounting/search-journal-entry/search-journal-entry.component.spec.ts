import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchJournalEntryComponent } from './search-journal-entry.component';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';

describe('SearchJournalEntryComponent', () => {
  let component: SearchJournalEntryComponent;
  let fixture: ComponentFixture<SearchJournalEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchJournalEntryComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule
      ],
      providers: [DatePipe]
    }).compileComponents();
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
