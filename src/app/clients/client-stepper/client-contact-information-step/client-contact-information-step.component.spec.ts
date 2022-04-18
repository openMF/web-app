import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientContactInformationStepComponent } from './client-contact-information-step.component';

describe('ClientContactInformationStepComponent', () => {
  let component: ClientContactInformationStepComponent;
  let fixture: ComponentFixture<ClientContactInformationStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientContactInformationStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientContactInformationStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
