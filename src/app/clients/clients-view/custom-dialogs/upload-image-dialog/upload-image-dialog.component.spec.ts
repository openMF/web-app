import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { UploadImageDialogComponent } from './upload-image-dialog.component';

describe('UploadImageDialogComponent', () => {
  let component: UploadImageDialogComponent;
  let fixture: ComponentFixture<UploadImageDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ UploadImageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UploadImageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
