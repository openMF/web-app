import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { GroupNavigationComponent } from './group-navigation.component';

describe('GroupNavigationComponent', () => {
  let component: GroupNavigationComponent;
  let fixture: ComponentFixture<GroupNavigationComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ GroupNavigationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GroupNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
