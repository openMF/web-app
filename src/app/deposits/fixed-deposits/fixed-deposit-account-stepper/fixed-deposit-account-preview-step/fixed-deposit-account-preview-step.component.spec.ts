import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FixedDepositAccountPreviewStepComponent } from './fixed-deposit-account-preview-step.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('FixedDepositAccountPreviewStepComponent', () => {
  let component: FixedDepositAccountPreviewStepComponent;
  let fixture: ComponentFixture<FixedDepositAccountPreviewStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [FixedDepositAccountPreviewStepComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FixedDepositAccountPreviewStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
