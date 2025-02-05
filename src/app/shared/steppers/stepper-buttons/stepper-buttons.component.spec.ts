import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

import { StepperButtonsComponent } from './stepper-buttons.component';

describe('StepperButtonsComponent', () => {
  let component: StepperButtonsComponent;
  let fixture: ComponentFixture<StepperButtonsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [StepperButtonsComponent],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(StepperButtonsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
