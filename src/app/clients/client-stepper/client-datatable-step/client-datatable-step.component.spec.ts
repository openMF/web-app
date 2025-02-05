import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDatatableStepComponent } from './client-datatable-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ClientDatatableStepComponent', () => {
  let component: ClientDatatableStepComponent;
  let fixture: ComponentFixture<ClientDatatableStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientDatatableStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      providers: [DatePipe],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientDatatableStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
