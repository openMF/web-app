import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReleaseAmountDialogComponent } from './release-amount-dialog.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('ReleaseAmountDialogComponent', () => {
  let component: ReleaseAmountDialogComponent;
  let fixture: ComponentFixture<ReleaseAmountDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ReleaseAmountDialogComponent],
      imports: [
        MatDialogModule,
        TranslateModule
      ],
      providers: [
        TranslateService,
        {
          provide: MatDialogRef,
          useValue: { close: () => {} }
        }
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReleaseAmountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
