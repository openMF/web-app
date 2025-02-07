import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCodeComponent } from './edit-code.component';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('EditCodeComponent', () => {
  let component: EditCodeComponent;
  let fixture: ComponentFixture<EditCodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [EditCodeComponent],
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
    fixture = TestBed.createComponent(EditCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
