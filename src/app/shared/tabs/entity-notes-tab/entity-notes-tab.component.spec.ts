import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityNotesTabComponent } from './entity-notes-tab.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('EntityNotesTabComponent', () => {
  let component: EntityNotesTabComponent;
  let fixture: ComponentFixture<EntityNotesTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityNotesTabComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        MatDialogModule
      ],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityNotesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
