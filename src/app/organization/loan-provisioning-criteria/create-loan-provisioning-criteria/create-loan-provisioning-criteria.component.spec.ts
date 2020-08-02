import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanProvisioningCriteriaComponent } from './create-loan-provisioning-criteria.component';

describe('CreateLoanProvisioningCriteriaComponent', () => {
  let component: CreateLoanProvisioningCriteriaComponent;
  let fixture: ComponentFixture<CreateLoanProvisioningCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLoanProvisioningCriteriaComponent ]
    })
    .compileComponents();
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
