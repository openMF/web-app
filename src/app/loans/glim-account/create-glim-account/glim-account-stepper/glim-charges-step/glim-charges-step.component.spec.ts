import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GlimChargesStepComponent } from './glim-charges-step.component';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';

describe('GlimChargesStepComponent', () => {
  let component: GlimChargesStepComponent;
  let fixture: ComponentFixture<GlimChargesStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [GlimChargesStepComponent],
      imports: [
        MatDialogModule,
        TranslateModule,
        CommonModule
      ],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GlimChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
