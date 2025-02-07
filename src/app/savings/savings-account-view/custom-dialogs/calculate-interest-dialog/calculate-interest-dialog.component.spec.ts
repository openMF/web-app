import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculateInterestDialogComponent } from './calculate-interest-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('CalculateInterestDialogComponent', () => {
  let component: CalculateInterestDialogComponent;
  let fixture: ComponentFixture<CalculateInterestDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CalculateInterestDialogComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        RouterTestingModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CalculateInterestDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
