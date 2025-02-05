import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewGlAccountComponent } from './view-gl-account.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('ViewGlAccountComponent', () => {
  let component: ViewGlAccountComponent;
  let fixture: ComponentFixture<ViewGlAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewGlAccountComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatDialogModule,
        ReactiveFormsModule,
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
    fixture = TestBed.createComponent(ViewGlAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
