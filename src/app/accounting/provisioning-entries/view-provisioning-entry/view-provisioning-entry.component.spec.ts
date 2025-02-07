import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProvisioningEntryComponent } from './view-provisioning-entry.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateFakeLoader } from '@ngx-translate/core';

describe('ViewProvisioningEntryComponent', () => {
  let component: ViewProvisioningEntryComponent;
  let fixture: ComponentFixture<ViewProvisioningEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewProvisioningEntryComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        CommonModule,
        ReactiveFormsModule,
        TranslateModule.forRoot({
          loader: { provide: TranslateLoader, useClass: TranslateFakeLoader }
        })

      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ViewProvisioningEntryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
