import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingsDocumentsTabComponent } from './savings-documents-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { DatePipe } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('SavingsDocumentsTabComponent', () => {
  let component: SavingsDocumentsTabComponent;
  let fixture: ComponentFixture<SavingsDocumentsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SavingsDocumentsTabComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        },
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingsDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
