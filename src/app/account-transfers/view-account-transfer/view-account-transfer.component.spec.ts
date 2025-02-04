import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAccountTransferComponent } from './view-account-transfer.component';
import { RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('ViewAccountTransferComponent', () => {
  let component: ViewAccountTransferComponent;
  let fixture: ComponentFixture<ViewAccountTransferComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewAccountTransferComponent],
      imports: [
        RouterTestingModule,
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewAccountTransferComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
