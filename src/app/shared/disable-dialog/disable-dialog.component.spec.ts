import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DisableDialogComponent } from './disable-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('DisableDialogComponent', () => {
  let component: DisableDialogComponent;
  let fixture: ComponentFixture<DisableDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [DisableDialogComponent],
      imports: [MatDialogModule]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DisableDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
