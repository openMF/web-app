import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProvisioningJournalEntriesComponent } from './view-provisioning-journal-entries.component';

describe('ViewProvisioningJournalEntriesComponent', () => {
  let component: ViewProvisioningJournalEntriesComponent;
  let fixture: ComponentFixture<ViewProvisioningJournalEntriesComponent>;

  beforeEach(async(() => {
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
