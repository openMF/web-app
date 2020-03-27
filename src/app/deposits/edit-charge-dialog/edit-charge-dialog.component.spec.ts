import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditChargeDialogComponent } from './edit-charge-dialog.component';

describe('EditChargeDialogComponent', () => {
  let component: EditChargeDialogComponent;
  let fixture: ComponentFixture<EditChargeDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditChargeDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditChargeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
