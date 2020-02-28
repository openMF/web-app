import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateLoanProvisioningComponent } from './create-loan-provisioning.component';

describe('CreateLoanProvisioningComponent', () => {
  let component: CreateLoanProvisioningComponent;
  let fixture: ComponentFixture<CreateLoanProvisioningComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateLoanProvisioningComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateLoanProvisioningComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
