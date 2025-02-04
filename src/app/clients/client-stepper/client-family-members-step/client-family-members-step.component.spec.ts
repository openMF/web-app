import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFamilyMembersStepComponent } from './client-family-members-step.component';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('ClientFamilyMembersStepComponent', () => {
  let component: ClientFamilyMembersStepComponent;
  let fixture: ComponentFixture<ClientFamilyMembersStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientFamilyMembersStepComponent],
      imports: [
        MatDialogModule,
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientFamilyMembersStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
