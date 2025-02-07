import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PrematureCloseFixedDepositsAccountComponent } from './premature-close-fixed-deposits-account.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('PrematureCloseFixedDepositsAccountComponent', () => {
  let component: PrematureCloseFixedDepositsAccountComponent;
  let fixture: ComponentFixture<PrematureCloseFixedDepositsAccountComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [PrematureCloseFixedDepositsAccountComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PrematureCloseFixedDepositsAccountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
