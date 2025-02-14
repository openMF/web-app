import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RejectSharesComponent } from './reject-shares.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('RejectSharesComponent', () => {
  let component: RejectSharesComponent;
  let fixture: ComponentFixture<RejectSharesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [RejectSharesComponent],
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
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RejectSharesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
