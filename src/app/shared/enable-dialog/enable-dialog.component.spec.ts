import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableDialogComponent } from './enable-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('EnableDialogComponent', () => {
  let component: EnableDialogComponent;
  let fixture: ComponentFixture<EnableDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EnableDialogComponent],
      imports: [MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
