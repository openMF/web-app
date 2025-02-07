import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { XBRLComponent } from './xbrl.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('XBRLComponent', () => {
  let component: XBRLComponent;
  let fixture: ComponentFixture<XBRLComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [XBRLComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
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
    fixture = TestBed.createComponent(XBRLComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
