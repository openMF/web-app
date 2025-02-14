import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { NextStepDialogComponent } from './next-step-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

describe('NextStepDialogComponent', () => {
  let component: NextStepDialogComponent;
  let fixture: ComponentFixture<NextStepDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [NextStepDialogComponent],
      imports: [
        MatDialogModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
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
    fixture = TestBed.createComponent(NextStepDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
