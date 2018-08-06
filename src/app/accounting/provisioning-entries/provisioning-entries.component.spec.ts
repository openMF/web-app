import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ProvisioningEntriesComponent } from './provisioning-entries.component';

describe('ProvisioningEntriesComponent', () => {
  let component: ProvisioningEntriesComponent;
  let fixture: ComponentFixture<ProvisioningEntriesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ProvisioningEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ProvisioningEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
