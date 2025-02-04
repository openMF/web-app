import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FormfieldComponent } from './formfield.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('FormfieldComponent', () => {
  let component: FormfieldComponent;
  let fixture: ComponentFixture<FormfieldComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FormfieldComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormfieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
