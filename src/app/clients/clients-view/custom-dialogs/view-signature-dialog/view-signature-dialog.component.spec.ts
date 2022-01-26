import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ViewSignatureDialogComponent } from './view-signature-dialog.component';

describe('ViewSignatureDialogComponent', () => {
  let component: ViewSignatureDialogComponent;
  let fixture: ComponentFixture<ViewSignatureDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ViewSignatureDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewSignatureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
