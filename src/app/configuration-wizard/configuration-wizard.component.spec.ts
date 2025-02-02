import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigurationWizardComponent } from './configuration-wizard.component';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';

describe('ConfigurationWizardComponent', () => {
  let component: ConfigurationWizardComponent;
  let fixture: ComponentFixture<ConfigurationWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ConfigurationWizardComponent],
      imports: [MatDialogModule],
      providers: [
        { provide: MatDialogRef, useValue: {} }]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigurationWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
