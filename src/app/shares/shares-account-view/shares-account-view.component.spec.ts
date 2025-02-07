import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { SharesAccountViewComponent } from './shares-account-view.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('SharesAccountViewComponent', () => {
  let component: SharesAccountViewComponent;
  let fixture: ComponentFixture<SharesAccountViewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [SharesAccountViewComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        }),
        MatDialogModule

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} }
      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharesAccountViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
