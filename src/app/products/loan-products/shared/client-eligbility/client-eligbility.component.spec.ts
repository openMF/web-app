import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientEligbilityComponent } from './client-eligbility.component';

describe('ClientEligbilityComponent', () => {
  let component: ClientEligbilityComponent;
  let fixture: ComponentFixture<ClientEligbilityComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ClientEligbilityComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientEligbilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
