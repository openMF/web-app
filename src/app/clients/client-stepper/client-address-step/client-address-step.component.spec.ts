import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientAddressStepComponent } from './client-address-step.component';

describe('ClientAddressStepComponent', () => {
  let component: ClientAddressStepComponent;
  let fixture: ComponentFixture<ClientAddressStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientAddressStepComponent ]
    })
    .compileComponents();
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
