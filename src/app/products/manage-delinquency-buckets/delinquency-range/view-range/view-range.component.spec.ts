import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

import { ViewRangeComponent } from './view-range.component';
import { RouterTestingModule } from '@angular/router/testing';

describe('ViewRangeComponent', () => {
  let component: ViewRangeComponent;
  let fixture: ComponentFixture<ViewRangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ViewRangeComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
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
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
