import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorLogPopoverComponent } from './error-log-popover.component';

describe('ErrorLogPopoverComponent', () => {
  let component: ErrorLogPopoverComponent;
  let fixture: ComponentFixture<ErrorLogPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ErrorLogPopoverComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(ErrorLogPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
