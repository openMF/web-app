import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharesAccountChargesStepComponent } from './shares-account-charges-step.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

describe('SharesAccountChargesStepComponent', () => {
  let component: SharesAccountChargesStepComponent;
  let fixture: ComponentFixture<SharesAccountChargesStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharesAccountChargesStepComponent],
      imports: [
        MatDialogModule,
        TranslateModule
      ],
      providers: [
        TranslateService,
        { provide: MatDialogRef, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountChargesStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
