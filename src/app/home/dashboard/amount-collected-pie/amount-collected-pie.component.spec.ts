import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AmountCollectedPieComponent } from './amount-collected-pie.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('AmountCollectedPieComponent', () => {
  let component: AmountCollectedPieComponent;
  let fixture: ComponentFixture<AmountCollectedPieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AmountCollectedPieComponent],
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AmountCollectedPieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
