import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanProvisioningCriteriaComponent } from './create-loan-provisioning-criteria.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';

describe('CreateLoanProvisioningCriteriaComponent', () => {
  let component: CreateLoanProvisioningCriteriaComponent;
  let fixture: ComponentFixture<CreateLoanProvisioningCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateLoanProvisioningCriteriaComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule
      ],
      providers: [
        DatePipe
      ]
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
