import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { CreateProvisioningEntryComponent } from './create-provisioning-entry.component';

describe('CreateProvisioningEntryComponent', () => {
  let component: CreateProvisioningEntryComponent;
  let fixture: ComponentFixture<CreateProvisioningEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateProvisioningEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateProvisioningEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
