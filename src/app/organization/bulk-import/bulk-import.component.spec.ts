import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BulkImportComponent } from './bulk-import.component';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('BulkImportComponent', () => {
  let component: BulkImportComponent;
  let fixture: ComponentFixture<BulkImportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [BulkImportComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BulkImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
