import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageReportsComponent } from './manage-reports.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { OverlayModule } from '@angular/cdk/overlay';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

describe('ManageReportsComponent', () => {
  let component: ManageReportsComponent;
  let fixture: ComponentFixture<ManageReportsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageReportsComponent],
      imports: [
        RouterTestingModule,
        OverlayModule,
        MatDialogModule,
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forRoot()
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
    fixture = TestBed.createComponent(ManageReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
