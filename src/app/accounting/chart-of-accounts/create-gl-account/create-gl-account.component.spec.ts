import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateGlAccountComponent } from './create-gl-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('CreateGlAccountComponent', () => {
  let component: CreateGlAccountComponent;
  let fixture: ComponentFixture<CreateGlAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateGlAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        OverlayModule,
        CommonModule,
        MatDialogModule,
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
    fixture = TestBed.createComponent(CreateGlAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
