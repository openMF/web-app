import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ClientPayChargesComponent } from './client-pay-charges.component';

describe('ClientPayChargesComponent', () => {
  let component: ClientPayChargesComponent;
  let fixture: ComponentFixture<ClientPayChargesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ClientPayChargesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClientPayChargesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
