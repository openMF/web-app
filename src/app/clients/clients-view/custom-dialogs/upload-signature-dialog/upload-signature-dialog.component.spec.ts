import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSignatureDialogComponent } from './upload-signature-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('UploadSignatureDialogComponent', () => {
  let component: UploadSignatureDialogComponent;
  let fixture: ComponentFixture<UploadSignatureDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [UploadSignatureDialogComponent],
      imports: [
        MatDialogModule,
        TranslateModule
      ],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {}
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadSignatureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
