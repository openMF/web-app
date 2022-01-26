import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ManageTaxConfigurationsComponent } from './manage-tax-configurations.component';

describe('ManageTaxConfigurationsComponent', () => {
  let component: ManageTaxConfigurationsComponent;
  let fixture: ComponentFixture<ManageTaxConfigurationsComponent>;

  beforeEach(waitForAsync(() => {
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
