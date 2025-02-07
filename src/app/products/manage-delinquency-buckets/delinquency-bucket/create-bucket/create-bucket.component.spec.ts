import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateBucketComponent } from './create-bucket.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('CreateBucketComponent', () => {
  let component: CreateBucketComponent;
  let fixture: ComponentFixture<CreateBucketComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateBucketComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        RouterTestingModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateBucketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
