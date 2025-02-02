import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSignatureDialogComponent } from './view-signature-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('ViewSignatureDialogComponent', () => {
  let component: ViewSignatureDialogComponent;
  let fixture: ComponentFixture<ViewSignatureDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewSignatureDialogComponent],
      imports: [MatDialogModule]
    }).compileComponents();
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
