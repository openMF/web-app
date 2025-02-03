import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddLoanChargeComponent } from './add-loan-charge.component';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { MatDialogRef } from '@angular/material/dialog';

describe('AddloanchargeComponent', () => {
  let component: AddLoanChargeComponent;
  let fixture: ComponentFixture<AddLoanChargeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AddLoanChargeComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        CommonModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {
            close: () => {}
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddLoanChargeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
