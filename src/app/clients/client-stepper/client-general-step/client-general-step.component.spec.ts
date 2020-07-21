import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientGeneralStepComponent } from './client-general-step.component';

describe('ClientGeneralStepComponent', () => {
  let component: ClientGeneralStepComponent;
  let fixture: ComponentFixture<ClientGeneralStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientGeneralStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientGeneralStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
