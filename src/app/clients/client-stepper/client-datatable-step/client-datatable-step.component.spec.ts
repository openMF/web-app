import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientDatatableStepComponent } from './client-datatable-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

describe('ClientDatatableStepComponent', () => {
  let component: ClientDatatableStepComponent;
  let fixture: ComponentFixture<ClientDatatableStepComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ClientDatatableStepComponent],
      imports: [
        ReactiveFormsModule,
        TranslateModule
      ],
      providers: [DatePipe]
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
