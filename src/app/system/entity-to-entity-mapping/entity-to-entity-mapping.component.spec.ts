import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityToEntityMappingComponent } from './entity-to-entity-mapping.component';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { CommonModule, DatePipe } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';

describe('EntityToEntityMappingComponent', () => {
  let component: EntityToEntityMappingComponent;
  let fixture: ComponentFixture<EntityToEntityMappingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EntityToEntityMappingComponent],
      imports: [
        ReactiveFormsModule,
        HttpClientModule,
        CommonModule,
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [
        DatePipe,
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
    fixture = TestBed.createComponent(EntityToEntityMappingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
