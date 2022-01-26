import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { EditLoanProvisioningCriteriaComponent } from './edit-loan-provisioning-criteria.component';

describe('EditLoanProvisioningCriteriaComponent', () => {
  let component: EditLoanProvisioningCriteriaComponent;
  let fixture: ComponentFixture<EditLoanProvisioningCriteriaComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ EditLoanProvisioningCriteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditLoanProvisioningCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
