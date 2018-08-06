import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProvisioningEntryComponent } from './view-provisioning-entry.component';

describe('ViewProvisioningEntryComponent', () => {
  let component: ViewProvisioningEntryComponent;
  let fixture: ComponentFixture<ViewProvisioningEntryComponent>;

  beforeEach(async(() => {
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
