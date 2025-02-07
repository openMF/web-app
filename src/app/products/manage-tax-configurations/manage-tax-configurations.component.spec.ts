import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTaxConfigurationsComponent } from './manage-tax-configurations.component';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ManageTaxConfigurationsComponent', () => {
  let component: ManageTaxConfigurationsComponent;
  let fixture: ComponentFixture<ManageTaxConfigurationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ManageTaxConfigurationsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageTaxConfigurationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
