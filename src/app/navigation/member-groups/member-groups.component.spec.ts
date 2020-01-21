import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MemberGroupsComponent } from './member-groups.component';

describe('MemberGroupsComponent', () => {
  let component: MemberGroupsComponent;
  let fixture: ComponentFixture<MemberGroupsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MemberGroupsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MemberGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
