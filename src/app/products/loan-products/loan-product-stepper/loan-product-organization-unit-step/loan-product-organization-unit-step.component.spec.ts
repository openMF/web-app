import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProductOrganizationUnitStepComponent } from './loan-product-organization-unit-step.component';

describe('LoanProductOrganizationUnitStepComponent', () => {
  let component: LoanProductOrganizationUnitStepComponent;
  let fixture: ComponentFixture<LoanProductOrganizationUnitStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LoanProductOrganizationUnitStepComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProductOrganizationUnitStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
