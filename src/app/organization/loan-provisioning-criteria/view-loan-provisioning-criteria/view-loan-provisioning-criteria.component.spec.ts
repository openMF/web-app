import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewLoanProvisioningCriteriaComponent } from './view-loan-provisioning-criteria.component';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

describe('ViewLoanProvisioningCriteriaComponent', () => {
  let component: ViewLoanProvisioningCriteriaComponent;
  let fixture: ComponentFixture<ViewLoanProvisioningCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewLoanProvisioningCriteriaComponent],
      imports: [
        HttpClientModule,
        CommonModule
      ]
    }).compileComponents();
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
