import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteSignatureDialogComponent } from './delete-signature-dialog.component';

describe('DeleteSignatureDialogComponent', () => {
  let component: DeleteSignatureDialogComponent;
  let fixture: ComponentFixture<DeleteSignatureDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeleteSignatureDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeleteSignatureDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
