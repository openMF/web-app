import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SearchToolComponent } from './search-tool.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('SearchToolComponent', () => {
  let component: SearchToolComponent;
  let fixture: ComponentFixture<SearchToolComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SearchToolComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SearchToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
