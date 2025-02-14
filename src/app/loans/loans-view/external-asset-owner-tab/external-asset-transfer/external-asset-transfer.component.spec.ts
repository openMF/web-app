import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAssetTransferComponent } from './external-asset-transfer.component';
import { TranslateFakeLoader, TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ExternalAssetTransferComponent', () => {
  let component: ExternalAssetTransferComponent;
  let fixture: ComponentFixture<ExternalAssetTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExternalAssetTransferComponent],
      imports: [
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [],
      schemas: [
        CUSTOM_ELEMENTS_SCHEMA
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExternalAssetTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
