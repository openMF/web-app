import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EnableDialogComponent } from './enable-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('EnableDialogComponent', () => {
  let component: EnableDialogComponent;
  let fixture: ComponentFixture<EnableDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EnableDialogComponent],
      imports: [MatDialogModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EnableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
