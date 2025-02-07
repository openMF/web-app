import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WaiveChargeDialogComponent } from './waive-charge-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('WaiveChargeDialogComponent', () => {
  let component: WaiveChargeDialogComponent;
  let fixture: ComponentFixture<WaiveChargeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [WaiveChargeDialogComponent],
      imports: [
        MatDialogModule,
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
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
    fixture = TestBed.createComponent(WaiveChargeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
