import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { SavingProductSettingsStepComponent } from './saving-product-settings-step.component';

describe('SavingProductSettingsStepComponent', () => {
  let component: SavingProductSettingsStepComponent;
  let fixture: ComponentFixture<SavingProductSettingsStepComponent>;

  beforeEach(waitForAsync(() => {
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
