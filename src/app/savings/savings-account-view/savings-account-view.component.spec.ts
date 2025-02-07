import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsAccountViewComponent } from './savings-account-view.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

describe('SavingsAccountViewComponent', () => {
  let component: SavingsAccountViewComponent;
  let fixture: ComponentFixture<SavingsAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingsAccountViewComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        },
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
