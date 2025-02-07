import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureImageDialogComponent } from './capture-image-dialog.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('CaptureImageDialogComponent', () => {
  let component: CaptureImageDialogComponent;
  let fixture: ComponentFixture<CaptureImageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CaptureImageDialogComponent],
      imports: [
        ReactiveFormsModule,
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
    fixture = TestBed.createComponent(CaptureImageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
