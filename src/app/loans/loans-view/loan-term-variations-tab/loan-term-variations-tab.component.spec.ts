import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanTermVariationsTabComponent } from './loan-term-variations-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('LoanTermVariationsTabComponent', () => {
  let component: LoanTermVariationsTabComponent;
  let fixture: ComponentFixture<LoanTermVariationsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LoanTermVariationsTabComponent],
      imports: [
        HttpClientModule,
        MatDialogModule
      ],
      providers: [
        DatePipe,
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

    fixture = TestBed.createComponent(LoanTermVariationsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
