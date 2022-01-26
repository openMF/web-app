import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewProvisioningJournalEntriesComponent } from './view-provisioning-journal-entries.component';

describe('ViewProvisioningJournalEntriesComponent', () => {
  let component: ViewProvisioningJournalEntriesComponent;
  let fixture: ComponentFixture<ViewProvisioningJournalEntriesComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewProvisioningJournalEntriesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProvisioningJournalEntriesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
