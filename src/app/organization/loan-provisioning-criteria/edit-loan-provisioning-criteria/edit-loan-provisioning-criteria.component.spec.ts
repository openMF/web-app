import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditLoanProvisioningCriteriaComponent } from './edit-loan-provisioning-criteria.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('EditLoanProvisioningCriteriaComponent', () => {
  let component: EditLoanProvisioningCriteriaComponent;
  let fixture: ComponentFixture<EditLoanProvisioningCriteriaComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditLoanProvisioningCriteriaComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
