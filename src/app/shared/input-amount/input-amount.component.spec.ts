import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InputAmountComponent } from './input-amount.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('InputAmountComponent', () => {
  let component: InputAmountComponent;
  let fixture: ComponentFixture<InputAmountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [InputAmountComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(InputAmountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
