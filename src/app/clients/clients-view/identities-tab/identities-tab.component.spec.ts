import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IdentitiesTabComponent } from './identities-tab.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('IdentitiesTabComponent', () => {
  let component: IdentitiesTabComponent;
  let fixture: ComponentFixture<IdentitiesTabComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IdentitiesTabComponent],
      imports: [
        MatDialogModule,
        HttpClientModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        { provide: MatDialogRef, useValue: {} },
        { provide: MAT_DIALOG_DATA, useValue: {} },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ id: '123' })
          }
        }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IdentitiesTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
