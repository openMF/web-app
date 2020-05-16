import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanProvisioningCriteriaComponent } from './view-loan-provisioning-criteria.component';

describe('ViewLoanProvisioningCriteriaComponent', () => {
  let component: ViewLoanProvisioningCriteriaComponent;
  let fixture: ComponentFixture<ViewLoanProvisioningCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewLoanProvisioningCriteriaComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewLoanProvisioningCriteriaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
