import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExternalAssetTransferComponent } from './external-asset-transfer.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('ExternalAssetTransferComponent', () => {
  let component: ExternalAssetTransferComponent;
  let fixture: ComponentFixture<ExternalAssetTransferComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ExternalAssetTransferComponent],
      imports: [TranslateModule],
      providers: [TranslateService]
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
