import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AcceptClientTransferComponent } from './accept-client-transfer.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DatePipe } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader, TranslateFakeLoader } from '@ngx-translate/core';

describe('AcceptClientTransferComponent', () => {
  let component: AcceptClientTransferComponent;
  let fixture: ComponentFixture<AcceptClientTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [AcceptClientTransferComponent],
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
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AcceptClientTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
