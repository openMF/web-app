import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { FormDialogComponent } from './form-dialog.component';

describe('FormDialogComponent', () => {
  let component: FormDialogComponent;
  let fixture: ComponentFixture<FormDialogComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ FormDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FormDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
