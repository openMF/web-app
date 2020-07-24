import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientFamilyMembersStepComponent } from './client-family-members-step.component';

describe('ClientFamilyMembersStepComponent', () => {
  let component: ClientFamilyMembersStepComponent;
  let fixture: ComponentFixture<ClientFamilyMembersStepComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientFamilyMembersStepComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientFamilyMembersStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
