import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageGroupMembersComponent } from './manage-group-members.component';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';

describe('ManageGroupMembersComponent', () => {
  let component: ManageGroupMembersComponent;
  let fixture: ComponentFixture<ManageGroupMembersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageGroupMembersComponent],
      imports: [
        RouterTestingModule,
        HttpClientModule
      ]
    }).compileComponents();
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
