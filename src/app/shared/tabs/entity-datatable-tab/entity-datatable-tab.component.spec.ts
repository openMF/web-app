import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDatatableTabComponent } from './entity-datatable-tab.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EntityDatatableTabComponent', () => {
  let component: EntityDatatableTabComponent;
  let fixture: ComponentFixture<EntityDatatableTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityDatatableTabComponent],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDatatableTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
