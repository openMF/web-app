import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ToggleWithholdTaxDialogComponent } from './toggle-withhold-tax-dialog.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('ToggleWithholdTaxDialogComponent', () => {
  let component: ToggleWithholdTaxDialogComponent;
  let fixture: ComponentFixture<ToggleWithholdTaxDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ToggleWithholdTaxDialogComponent],
      imports: [
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ToggleWithholdTaxDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
