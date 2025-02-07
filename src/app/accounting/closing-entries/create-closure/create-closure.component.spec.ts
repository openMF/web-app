import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateClosureComponent } from './create-closure.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('CreateClosureComponent', () => {
  let component: CreateClosureComponent;
  let fixture: ComponentFixture<CreateClosureComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [CreateClosureComponent],
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
    fixture = TestBed.createComponent(CreateClosureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
