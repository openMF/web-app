import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanDisbursalComponent } from './loan-disbursal.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RouterTestingModule } from '@angular/router/testing';

describe('LoanDisbursalComponent', () => {
  let component: LoanDisbursalComponent;
  let fixture: ComponentFixture<LoanDisbursalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [LoanDisbursalComponent],
      imports: [
        MatDialogModule,
        RouterTestingModule
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
    fixture = TestBed.createComponent(LoanDisbursalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
