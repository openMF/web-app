import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ThemeToggleComponent } from './theme-toggle.component';
import { DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ThemeToggleComponent],
      imports: [MatDialogModule],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
