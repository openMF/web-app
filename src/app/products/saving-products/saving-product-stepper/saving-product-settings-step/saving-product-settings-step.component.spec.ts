import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductSettingsStepComponent } from './saving-product-settings-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('SavingProductSettingsStepComponent', () => {
  let component: SavingProductSettingsStepComponent;
  let fixture: ComponentFixture<SavingProductSettingsStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingProductSettingsStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
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
