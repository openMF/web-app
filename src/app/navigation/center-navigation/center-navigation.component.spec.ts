import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CenterNavigationComponent } from './center-navigation.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('CenterNavigationComponent', () => {
  let component: CenterNavigationComponent;
  let fixture: ComponentFixture<CenterNavigationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CenterNavigationComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CenterNavigationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
