import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductAccountingStepComponent } from './saving-product-accounting-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('SavingProductAccountingStepComponent', () => {
  let component: SavingProductAccountingStepComponent;
  let fixture: ComponentFixture<SavingProductAccountingStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingProductAccountingStepComponent],
      imports: [
        ReactiveFormsModule,
        MatDialogModule,
        TranslateModule
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductAccountingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
