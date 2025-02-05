import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomParametersPopoverComponent } from './custom-parameters-popover.component';
import { HttpClientModule } from '@angular/common/http';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('CustomParametersPopoverComponent', () => {
  let component: CustomParametersPopoverComponent;
  let fixture: ComponentFixture<CustomParametersPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomParametersPopoverComponent],
      imports: [
        HttpClientModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomParametersPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
