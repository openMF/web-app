import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageGroupsComponent } from './manage-groups.component';

describe('ManageGroupsComponent', () => {
  let component: ManageGroupsComponent;
  let fixture: ComponentFixture<ManageGroupsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
