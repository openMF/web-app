import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddInterestPauseComponent } from './add-interest-pause.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('AddInterestPauseComponent', () => {
  let component: AddInterestPauseComponent;
  let fixture: ComponentFixture<AddInterestPauseComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddInterestPauseComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AddInterestPauseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
