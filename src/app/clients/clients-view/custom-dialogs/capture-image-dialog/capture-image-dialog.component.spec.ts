import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CaptureImageDialogComponent } from './capture-image-dialog.component';

describe('CaptureImageDialogComponent', () => {
  let component: CaptureImageDialogComponent;
  let fixture: ComponentFixture<CaptureImageDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CaptureImageDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CaptureImageDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
