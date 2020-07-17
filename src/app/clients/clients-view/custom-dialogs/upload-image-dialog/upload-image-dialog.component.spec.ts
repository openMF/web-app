import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadImageDialogComponent } from './upload-image-dialog.component';

describe('UploadImageDialogComponent', () => {
  let component: UploadImageDialogComponent;
  let fixture: ComponentFixture<UploadImageDialogComponent>;

  beforeEach(async(() => {
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
