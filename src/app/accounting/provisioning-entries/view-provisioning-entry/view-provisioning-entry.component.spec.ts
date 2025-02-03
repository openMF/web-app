import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProvisioningEntryComponent } from './view-provisioning-entry.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { TranslateModule } from '@ngx-translate/core';

describe('ViewProvisioningEntryComponent', () => {
  let component: ViewProvisioningEntryComponent;
  let fixture: ComponentFixture<ViewProvisioningEntryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ViewProvisioningEntryComponent],
      imports: [
        HttpClientModule,
        RouterTestingModule,
        TranslateModule
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
