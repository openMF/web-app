import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageGroupMembersComponent } from './manage-group-members.component';

describe('ManageGroupMembersComponent', () => {
  let component: ManageGroupMembersComponent;
  let fixture: ComponentFixture<ManageGroupMembersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageGroupMembersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageGroupMembersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
