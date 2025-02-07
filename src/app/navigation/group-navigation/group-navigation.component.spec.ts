import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { GroupNavigationComponent } from './group-navigation.component';

describe('GroupNavigationComponent', () => {
  let component: GroupNavigationComponent;
  let fixture: ComponentFixture<GroupNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [GroupNavigationComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
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
