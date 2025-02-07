import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecurringDepositsAccountViewComponent } from './recurring-deposits-account-view.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('RecurringDepositsAccountViewComponent', () => {
  let component: RecurringDepositsAccountViewComponent;
  let fixture: ComponentFixture<RecurringDepositsAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RecurringDepositsAccountViewComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule,
        MatDialogModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecurringDepositsAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
