import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewProvisioningEntryComponent } from './view-provisioning-entry.component';

describe('ViewProvisioningEntryComponent', () => {
  let component: ViewProvisioningEntryComponent;
  let fixture: ComponentFixture<ViewProvisioningEntryComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewProvisioningEntryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProvisioningEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
