import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateHookComponent } from './create-hook.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('CreateHookComponent', () => {
  let component: CreateHookComponent;
  let fixture: ComponentFixture<CreateHookComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateHookComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        ReactiveFormsModule,
        MatDialogModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateHookComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
