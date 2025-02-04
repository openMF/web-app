import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNotesDialogComponent } from './edit-notes-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditNotesDialogComponent', () => {
  let component: EditNotesDialogComponent;
  let fixture: ComponentFixture<EditNotesDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditNotesDialogComponent],
      imports: [
        MatDialogModule,
        ReactiveFormsModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditNotesDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
