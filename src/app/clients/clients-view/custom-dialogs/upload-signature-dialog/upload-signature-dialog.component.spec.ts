import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadSignatureDialogComponent } from './upload-signature-dialog.component';

describe('UploadSignatureDialogComponent', () => {
  let component: UploadSignatureDialogComponent;
  let fixture: ComponentFixture<UploadSignatureDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadSignatureDialogComponent ]
    })
    .compileComponents();
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
