import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadDocumentDialogComponent } from './upload-document-dialog.component';

describe('UploadDocumentDialogComponent', () => {
  let component: UploadDocumentDialogComponent;
  let fixture: ComponentFixture<UploadDocumentDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadDocumentDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadDocumentDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
