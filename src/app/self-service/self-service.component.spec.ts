import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { SelfServiceComponent } from './self-service.component';

describe('SelfServiceComponent', () => {
  let component: SelfServiceComponent;
  let fixture: ComponentFixture<SelfServiceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SelfServiceComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SelfServiceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
