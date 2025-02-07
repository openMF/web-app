import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SessionTimeoutDialogComponent } from './session-timeout-dialog.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('SessionTimeoutDialogComponent', () => {
  let component: SessionTimeoutDialogComponent;
  let fixture: ComponentFixture<SessionTimeoutDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SessionTimeoutDialogComponent],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SessionTimeoutDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
