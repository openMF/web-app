import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StandingInstructionsTabComponent } from './standing-instructions-tab.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('StandingInstructionsTabComponent', () => {
  let component: StandingInstructionsTabComponent;
  let fixture: ComponentFixture<StandingInstructionsTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [StandingInstructionsTabComponent],
      imports: [
        RouterTestingModule,
        MatDialogModule
      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StandingInstructionsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
