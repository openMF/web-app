import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanProvisioningCriteriaComponent } from './create-loan-provisioning-criteria.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('CreateLoanProvisioningCriteriaComponent', () => {
  let component: CreateLoanProvisioningCriteriaComponent;
  let fixture: ComponentFixture<CreateLoanProvisioningCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateLoanProvisioningCriteriaComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        MatDialogModule
      ],
      providers: [
        DatePipe,
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLoanProvisioningCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
