import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualCollectionSheetComponent } from './individual-collection-sheet.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('IndividualCollectionSheetComponent', () => {
  let component: IndividualCollectionSheetComponent;
  let fixture: ComponentFixture<IndividualCollectionSheetComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [IndividualCollectionSheetComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        RouterTestingModule,
        CommonModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IndividualCollectionSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
