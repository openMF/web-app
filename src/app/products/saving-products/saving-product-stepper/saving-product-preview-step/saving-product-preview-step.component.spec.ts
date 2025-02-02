import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SavingProductPreviewStepComponent } from './saving-product-preview-step.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('SavingProductPreviewStepComponent', () => {
  let component: SavingProductPreviewStepComponent;
  let fixture: ComponentFixture<SavingProductPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SavingProductPreviewStepComponent],
      imports: [TranslateModule],
      providers: [TranslateService]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SavingProductPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
