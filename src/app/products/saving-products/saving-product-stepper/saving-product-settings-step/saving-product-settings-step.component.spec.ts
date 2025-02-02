import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductSettingsStepComponent } from './saving-product-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';

describe('SavingProductSettingsStepComponent', () => {
  let component: SavingProductSettingsStepComponent;
  let fixture: ComponentFixture<SavingProductSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingProductSettingsStepComponent],
      imports: [ReactiveFormsModule]
    }).compileComponents();
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
