import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewProvisioningEntryComponent } from './view-provisioning-entry.component';
import { HttpClientModule } from '@angular/common/http';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

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
        ReactiveFormsModule
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
