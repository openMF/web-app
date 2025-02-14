import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientAddressStepComponent } from './client-address-step.component';
import { MatDialogModule } from '@angular/material/dialog';
import { TranslateFakeLoader, TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';

describe('ClientAddressStepComponent', () => {
  let component: ClientAddressStepComponent;
  let fixture: ComponentFixture<ClientAddressStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ClientAddressStepComponent],
      imports: [
        MatDialogModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientAddressStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
