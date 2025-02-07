import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

import { EntityDocumentsTabComponent } from './entity-documents-tab.component';

describe('EntityDocumentsTabComponent', () => {
  let component: EntityDocumentsTabComponent;
  let fixture: ComponentFixture<EntityDocumentsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityDocumentsTabComponent],
      imports: [
        MatDialogModule,
        HttpClientModule,
        CommonModule,
        ReactiveFormsModule,
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe
      ]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDocumentsTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
