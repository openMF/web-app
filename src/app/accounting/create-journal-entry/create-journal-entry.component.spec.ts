import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateJournalEntryComponent } from './create-journal-entry.component';

describe('CreateJournalEntryComponent', () => {
  let component: CreateJournalEntryComponent;
  let fixture: ComponentFixture<CreateJournalEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateJournalEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateJournalEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
