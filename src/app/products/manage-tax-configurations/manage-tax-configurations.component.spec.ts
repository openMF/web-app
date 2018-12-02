import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageTaxConfigurationsComponent } from './manage-tax-configurations.component';

describe('ManageTaxConfigurationsComponent', () => {
  let component: ManageTaxConfigurationsComponent;
  let fixture: ComponentFixture<ManageTaxConfigurationsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageTaxConfigurationsComponent ]
    })
    .compileComponents();
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
