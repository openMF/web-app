import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductSettingsStepComponent } from './saving-product-settings-step.component';

describe('SavingProductSettingsStepComponent', () => {
  let component: SavingProductSettingsStepComponent;
  let fixture: ComponentFixture<SavingProductSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SavingProductSettingsStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductSettingsStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
