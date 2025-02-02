import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorLogPopoverComponent } from './error-log-popover.component';
import { MatDialogModule } from '@angular/material/dialog';

describe('ErrorLogPopoverComponent', () => {
  let component: ErrorLogPopoverComponent;
  let fixture: ComponentFixture<ErrorLogPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorLogPopoverComponent],
      imports: [MatDialogModule]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorLogPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
