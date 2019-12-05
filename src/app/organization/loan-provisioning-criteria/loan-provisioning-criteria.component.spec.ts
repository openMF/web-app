import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoanProvisioningCriteriaComponent } from './loan-provisioning-criteria.component';

describe('LoanProvisioningCriteriaComponent', () => {
  let component: LoanProvisioningCriteriaComponent;
  let fixture: ComponentFixture<LoanProvisioningCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoanProvisioningCriteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoanProvisioningCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
