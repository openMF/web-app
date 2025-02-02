import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateJournalEntryComponent } from './create-journal-entry.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

describe('CreateJournalEntryComponent', () => {
  let component: CreateJournalEntryComponent;
  let fixture: ComponentFixture<CreateJournalEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateJournalEntryComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule
      ]
    }).compileComponents();
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
